import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import db, { auth, rdb } from "../firebase";

const GameContext = React.createContext();

function GameProvider({ children }) {
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

  let { gameId } = useParams();
  const baseRef = `/games/${gameId}`;

  // Anonymously authenticate user and set name
  const checkIn = () => auth.signInAnonymously();

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
          return setCurrentPlayer(player);
        }
        checkIn();
      });
      return unsubscribe;
    };
    return initPlayer();
  }, []);

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
    console.log("the leader", teamLeader);
    console.log("pid", currentPlayer.uid);
  };

  const initRDBListeners = ledger => {
    // teams listener
    // const unsubscribeTeams = rdb
    //   .ref(`${baseRef}/teams`)
    //   .on("value", snapshot => setTeams(snapshot.val()));
    // // players listener
    // const unsubscribePlayers = rdb
    //   .ref(`${baseRef}/players`)
    //   .on("value", snapshot => setPlayers(snapshot.val()));
    // startTime listener
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

  // Logout anon user
  // const checkOut = () => auth.signOut();

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
    leader
  };

  return (
    <GameContext.Provider value={value}>
      {error && <p>{error}</p>}
      {!loading && game && room && children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
export default GameProvider;
