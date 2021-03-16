const functions = require("firebase-functions");
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });
const _ = require("lodash");
const { nanoid } = require("nanoid");

const utils = require("./utils");
const CMSApi = require("./classes/CMSApi");
const TeamScorer = require("./classes/TeamScorer");

/**
 * Temp api endpoint that fetches and updates
 * all Escape Rooms from Wordpress API
 */
exports.updateEscapeRooms = functions.https.onRequest(async (req, res) => {
  let rooms = await CMSApi.getAllRooms();
  const getChallengePromises = rooms.map(Room => Room.getChallenges());

  await Promise.all(getChallengePromises);

  rooms = rooms.map(Room => {
    const obj = {};
    obj.id = Room.id;
    obj.slug = Room.slug;
    obj.title = Room.title;
    obj.duration = Room.duration || 90;
    obj.intro = {
      content: Room.intro,
      background: Room.coverImage("full") || null
    };
    obj.status = Room.status;
    obj.challenges = {};
    Room.challenges.forEach(challenge => {
      // enter challenges into challenge obj
      obj.challenges[challenge.id] = {
        questions: challenge.acf.questions,
        clue: challenge.acf.clue,
        content: challenge.content.rendered,
        title: challenge.title.rendered
      };
    });
    obj.challengeMap = Room.challengeMap;
    obj.outro = {
      content: Room.outro,
      background: Room.outroImage || null
    };
    obj.videoBackground = Room.videoBackground || null;
    return obj;
  });

  const batch = admin.firestore().batch();

  rooms.forEach(room => {
    console.log(room.slug);
    const ref = admin
      .firestore()
      .collection("rooms")
      .doc(room.slug);
    batch.set(ref, { ...room });
  });

  await batch.commit();
  res.send({
    success: true,
    rooms: rooms.length
  });
});

/**
 * Create game ledger in RTDB when created in firestore
 */
exports.createGameLedger = functions.firestore
  .document("games/{gameId}")
  .onCreate((snapshot, context) => {
    return admin
      .database()
      .ref(`er-games/${context.params.gameId}`)
      .set({
        stage: "dormant",
        host: snapshot.data().host.id
      });
  });

/**
 * Delete game ledger when deleted in firestore
 */
exports.deleteGameLedger = functions.firestore
  .document("games/{gameId}")
  .onDelete((change, context) => {
    return Promise.all([
      admin
        .database()
        .ref(`er-games/${context.params.gameId}`)
        .remove(),
      admin
        .database()
        .ref(`er-teams/${context.params.gameId}`)
        .remove(),
      admin
        .database()
        .ref(`er-players/${context.params.gameId}`)
        .remove(),
      admin
        .database()
        .ref(`er-rankings/${context.params.gameId}`)
        .remove()
    ]);
  });

/**
 * Register host
 */
exports.registerHost = functions.https.onCall(async (data, context) => {
  const MASTERKEY = "GameMasterHernandez";
  const { referralCode, firstName, lastName, email, password } = data;
  // allow entry for users with MASTERKEY
  let findCosigners
  if (referralCode !== MASTERKEY) {
    // check for cosigner
    findCosigners = await admin
      .firestore()
      .collection("users")
      .where("referralCode", "==", referralCode)
      .limit(1)
      .get();
    if (findCosigners.empty) {
      throw new functions.https.HttpsError(
        "permission-denied",
        `"${referralCode}" is not a valid referral code.`
      );
    }
  }
  // create user
  const { uid } = await admin.auth().createUser({
    email,
    password,
    displayName: `${firstName} ${lastName}`
  });
  const hostRecord = {
    firstName,
    lastName,
    email,
    referralCode: utils.generateReferralCode()
  };
  // create user record in firestore
  await admin
    .firestore()
    .collection("users")
    .doc(uid)
    .set(hostRecord);
  if (referralCode !== MASTERKEY) {
    // add new host to cosigner's cosignees
    const cosigner = findCosigners.docs[0];
    const existingCosignees = cosigner.data().cosigned || [];
    await admin
      .firestore()
      .collection("users")
      .doc(cosigner.id)
      .update({ cosigned: [...existingCosignees, uid] });
  }
  return { uid, ...hostRecord };
});

/**
 * End game and rank teams when game is over
 */
exports.endGame = functions.https.onCall(async (data, context) => {
  const { gameId } = data;

  const { uid } = context.auth;

  const gameLedgerRoot = `/er-games/${gameId}`;

  // verify that user is host of game
  const gameLedger = await admin
    .database()
    .ref(gameLedgerRoot)
    .get();

  if (!gameLedger.exists()) {
    throw new functions.https.HttpsError(
      "not-found",
      `"Game with id ${gameId}" not found.`
    );
  }

  if (gameLedger.val().host !== uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      `"You are not the host of this game.`
    );
  }

  const teams = await admin
    .database()
    .ref(`er-teams/${gameId}`)
    .get();

  const gameFirestore = await admin
    .firestore()
    .collection("games")
    .doc(gameId)
    .get();

  if (!gameFirestore.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      `Game with id "${gameId}" not found in firestore.`
    );
  }

  // get room
  const room = await admin
    .firestore()
    .collection("rooms")
    .doc(gameFirestore.data().room)
    .get();

  if (!room.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      `Room with id "${gameFirestore.data().room}" not found in firestore.`
    );
  }

  const updates = {}; // hold all updates to rdb

  // set game stage to final
  updates[`${gameLedgerRoot}/stage`] = "final";

  const scorer = new TeamScorer({
    teams: teams.val(),
    startTime: gameLedger.val().startTime,
    challengeMap: room.data().challengeMap
  });

  scorer.getRankings();

  const rankings = scorer.getRankingsObject();

  updates[`er-rankings/${gameId}`] = rankings;

  return admin
    .database()
    .ref()
    .update(updates);
});
