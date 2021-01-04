const functions = require("firebase-functions");
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });
const _ = require("lodash");
const { nanoid } = require("nanoid");

const utils = require("./utils");
const CMSApi = require("./classes/CMSApi");

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
  .onCreate((change, context) => {
    return functions.database.ref(`games/${context.params.gameId}`).add({
      stage: "dormant"
    });
  });

/**
 * Delete game ledger when deleted in firestore
 */
exports.deleteGameLedger = functions.firestore
  .document("games/{gameId}")
  .onDelete((change, context) => {
    console.log("to delete", context.params.gameId);
    return admin
      .database()
      .ref(`games/${context.params.gameId}`)
      .remove();
  });

/**
 * Register host
 */
exports.registerHost = functions.https.onCall(async (data, context) => {
  const { referralCode, firstName, lastName, email, password } = data;
  // check for cosigner
  const findCosigners = await admin
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
  // create user
  const { uid } = await admin.auth().createUser({
    email,
    password,
    displayName: `${firstName} ${lastName}`
  });
  // create user record in firestore
  const hostRecord = await admin
    .firestore()
    .collection("users")
    .doc(uid)
    .set({
      firstName,
      lastName,
      email,
      referralCode: utils.generateReferralCode()
    });
  // add new host to cosigner's cosignees
  const cosigner = findCosigners.docs[0];
  const existingCosignees = cosigner.data().cosigned || [];
  await admin
    .firestore()
    .collection("users")
    .doc(cosigner.id)
    .update({ cosigned: [...existingCosignees, uid] });
  return uid;
});
