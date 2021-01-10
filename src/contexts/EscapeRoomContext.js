import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import db, { auth, rdb } from "../firebase";

const EscapeRoomContext = React.createContext();

function EscapeRoomProvider({ children }) {
  const [currentPlayer, setCurrentPlayer] = useState();
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(null);
  const [room, setRoom] = useState({});
  const [error, setError] = useState("");
  const [stage, setStage] = useState("");
  const [teams, setTeams] = useState({});
  const [players, setPlayers] = useState({});
  const [startTime, setStartTime] = useState();
  const [leader, setLeader] = useState();
  const [activeLeavePrompt, setActiveLeavePrompt] = useState(false);

  let { gameId } = useParams();
  const baseRef = `/games/${gameId}`;

  // Anonymously authenticate user and set name
  const checkIn = () => auth.signInAnonymously();
  // Logout anon user
  const checkOut = () => auth.signOut();
  // attach logout to window
  window.jwAnonLogout = checkOut;

  useEffect(() => {
    if (activeLeavePrompt === true) {
      window.onbeforeunload = () => "Are you sure you want to leave this page?";
    } else {
      window.onbeforeunload = null;
    }
    console.log("leave", activeLeavePrompt);
  }, [activeLeavePrompt]);

  useEffect(() => {
    const initGame = async () => {
      let gameData = await findGame(gameId);
      await findRoom(gameData.room);
      initRDBListeners();
      setLoading(false);
    };
    initGame();
    const initPlayer = async () => {
      const unsubscribe = auth.onAuthStateChanged(player => {
        if (player) {
          setActiveLeavePrompt(true);
          return setCurrentPlayer(player);
        }
        checkIn();
      });
      return unsubscribe;
    };
    return initPlayer();
  }, []);

  /**
   * Set unload prompt on any stage other than dormant
   */
  useEffect(() => {
    if (stage !== "dormant") {
      setActiveLeavePrompt(true);
    }
  }, [stage]);

  /**
   * Get host from db with host id
   * @param  {String}  id hostId
   * @return {Object}  Host data
   */
  const findHost = async id => {
    const foundHost = await db
      .collection("users")
      .doc(id)
      .get();
    if (!foundHost.exists) {
      return setError(`Host with id ${id} not found`);
    }
    return foundHost.data();
  };

  /**
   * Find game by gameId and set in state
   * @param  {String}  id Game id
   * @return {Object}  Game data
   */
  const findGame = async id => {
    const foundGame = await db
      .collection("games")
      .doc(id)
      .get();
    if (!foundGame.exists) {
      return setError(`Game with id ${id} not found`);
    }
    // find host
    const host = await findHost(foundGame.data().host.id);
    const gameData = { ...foundGame.data(), host };
    setGame(gameData);
    return gameData;
  };

  /**
   * Find Escape Room content by slug
   * and set in state
   * @param  {String}  slug Room slug
   */
  const findRoom = async slug => {
    const foundRoom = await db
      .collection("rooms")
      .doc(slug)
      .get();
    console.log("rooom", slug);
    if (!foundRoom.exists) {
      return setError(`Room with slug ${slug} not found in firestore`);
    }
    setRoom(foundRoom.data());
  };

  /**
   * Get teams from firebase after creation
   */
  const getTeams = async () => {
    // get created teams
    let snapshotTeams = await rdb.ref(`${baseRef}/teams`).once("value");
    setTeams(snapshotTeams.val());
    // get players
    let snapshotPlayers = await rdb.ref(`${baseRef}/players`).once("value");
    setPlayers(snapshotPlayers.val());
    const { team } = snapshotPlayers.val()[currentPlayer.uid];
    // set current player's team
    setCurrentPlayer(prevState => ({ ...prevState, team }));
    const teamLeaderId = snapshotTeams.val()[team].leader;
    const teamLeader = {
      id: teamLeaderId,
      ...snapshotPlayers.val()[teamLeaderId]
    };
    setLeader(teamLeader);
  };

  /**
   * Initialize real time database listeners
   * @return {Object} Unsubscribe functions
   */
  const initRDBListeners = () => {
    const unsubscribeStartTime = rdb
      .ref(`${baseRef}/startTime`)
      .on("value", snapshot => setStartTime(snapshot.val()));
    // stage listener
    const unsubscribeStage = rdb
      .ref(`${baseRef}/stage`)
      .on("value", snapshot => {
        setStage(snapshot.val());
      });
    // return unsubscribers
    return {
      unsubscribeStartTime,
      unsubscribeStage
    };
  };

  /**
   * Enter player into game ledger
   * @param  {String}  displayName User display name
   * FIXME: is this right, should event be
   * unsubscribed right after call?
   */
  const enterPlayer = async displayName => {
    await currentPlayer.updateProfile({ displayName });
    const unsubscribe = auth.onAuthStateChanged(player => {
      setCurrentPlayer(player);
      // enter user into ledger
      rdb.ref(`${baseRef}/players/${player.uid}`).set({
        name: player.displayName
      });
    });
    unsubscribe();
  };

  const value = {
    currentPlayer,
    game,
    room,
    stage,
    enterPlayer,
    teams,
    players,
    getTeams,
    startTime,
    leader
  };

  return (
    <EscapeRoomContext.Provider value={value}>
      {error && <p>{error}</p>}
      {!loading && game && room && children}
    </EscapeRoomContext.Provider>
  );
}

export const useGame = () => useContext(EscapeRoomContext);
export default EscapeRoomProvider;
