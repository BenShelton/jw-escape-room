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

  let { gameId } = useParams();
  const baseRef = `/games/${gameId}`;

  // Anonymously authenticate user and set name
  const checkIn = () => auth.signInAnonymously();

  useEffect(() => {
    const initGame = async () => {
      let gameData = await findGame(gameId);
      await findRoom(gameData.room.id);
      initRDBListeners();
      setLoading(false);
    };
    initGame();
    const initPlayer = async () => {
      const unsubscribe = auth.onAuthStateChanged(player => {
        if (player) {
          console.log("already in");
          return setCurrentPlayer(player);
        }
        console.log("checking in");
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
    console.log("game data", gameData);
    return gameData;
  };

  const findRoom = async slug => {
    const foundRoom = await db
      .collection("rooms")
      .doc(slug)
      .get();
    if (!foundRoom.exists) {
      return setError(`Room with slug ${slug} not found in firestore`);
    }
    setRoom(foundRoom.data());
  };

  const initRDBListeners = ledger => {
    // teams listener
    const unsubscribeTeams = rdb
      .ref(`${baseRef}/teams`)
      .on("value", snapshot => {
        console.log("LISTENING ON /teams", snapshot.val());
      });
    // players listener
    const unsubscribePlayers = rdb
      .ref(`${baseRef}/players`)
      .on("value", snapshot => {
        console.log("LISTENING ON /players", snapshot.val());
      });
    // startTime listener
    const unsubscribeStartTime = rdb
      .ref(`${baseRef}/teams`)
      .on("value", snapshot => {
        console.log("LISTENING ON /startTime", snapshot.val());
      });
    // stage listener
    const unsubscribeStage = rdb
      .ref(`${baseRef}/stage`)
      .on("value", snapshot => {
        setStage(snapshot.val());
        console.log("LISTENING ON /stage", snapshot.val());
      });
    // return unsubscribers
    return {
      unsubscribeTeams,
      unsubscribePlayers,
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
    enterPlayer
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
