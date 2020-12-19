import React, { useContext, useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";

import db, { rdb } from "../firebase";
const GameHostContext = React.createContext();

const GameHostProvider = ({ children }) => {
  const [game, setGame] = useState();
  const [error, setError] = useState();
  // const [room, setRoom] = useState();
  const [players, setPlayers] = useState({});
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState("");

  const { gameId } = useParams();

  const gameURL = `${process.env.REACT_APP_SITE_URL}/play/${gameId}`;

  const baseRef = `games/${gameId}`;
  const playersRef = rdb.ref(`${baseRef}/players`);
  const teamsRef = rdb.ref(`${baseRef}/teams`);
  const stageRef = rdb.ref(`${baseRef}/stage`);
  const startTimeRef = rdb.ref(`${baseRef}/startTime`);

  const initPlayerListeners = () => {
    const unsubscribeAdd = playersRef.on("child_added", snapshot =>
      setPlayers(prevState => ({
        ...prevState,
        [snapshot.getRef().getKey()]: snapshot.val()
      }))
    );
    const unsubscribeRemove = playersRef.on("child_removed", snapshot =>
      setPlayers(prevState => {
        const mod = { ...prevState };
        delete mod[snapshot.getRef().getKey()];
        return { ...mod };
      })
    );
    return { unsubscribeAdd, unsubscribeRemove };
  };

  const initStageListener = () => {
    return stageRef.on("value", snapshot => {
      if (snapshot.val() !== stage) {
        setStage(snapshot.val());
      }
    });
  };

  const initTeamListener = () => {
    // get current teams if they exist
    teamsRef.once("value", snapshot => {
      // snapshot.exists() ? setTeams(snapshot.val()) : null
      console.log("teams", snapshot.exists());
    });
    // return teamsRef.on("child_changed", snapshot =>
    //   setTeams(prevState => ({
    //     ...prevState,
    //     [snapshot.getRef().getKey()]: snapshot.val()
    //   }))
    // );
  };

  const initGame = async () => {
    // find game in firestore
    const foundGame = await db
      .collection("games")
      .doc(gameId)
      .get();
    if (!foundGame) {
      return setError(`Game with id ${gameId} not found.`);
    }
    setGame({ ...foundGame.data(), id: foundGame.id });
    // find ledger or create it
    let ledger = await rdb.ref(baseRef).once("value");
    if (!ledger.exists()) {
      ledger = await rdb.ref(baseRef).set({
        stage: "dormant",
        players: {},
        teams: {},
        startTime: null
      });
    }
    await initPlayerListeners();
    initStageListener();
    initTeamListener();
    setLoading(false);
  };

  const startGame = () => {
    setStage("playing");
    // set start time
    startTimeRef.set(moment().unix());
    console.log("GAME STARTED!");
  };

  const writeTeams = async () => {
    const updates = {};
    const teamObj = {};
    const teamIds = Object.keys(teams);
    for (let i = 0; i < teamIds.length; i++) {
      const teamId = teamIds[i];
      const team = teams[teamId];
      team.forEach(player => {
        updates[`${baseRef}/players/${player.id}/team`] = teamId;
        if (player.leader === true) {
          teamObj[teamId] = { leader: player.id };
        }
      });
    }
    await Promise.all([
      rdb.ref().update(updates),
      rdb.ref(`${baseRef}/teams`).set(teamObj)
    ]);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    // dont set if empty
    if (stage !== "") {
      stageRef.set(stage);
    }
  }, [stage]);

  const value = {
    players,
    teams,
    setTeams,
    writeTeams,
    game,
    stage,
    setStage,
    startGame,
    baseRef,
    teamsRef,
    gameURL
  };

  return (
    <GameHostContext.Provider value={value}>
      {error ? <p>{error}</p> : !loading && children}
    </GameHostContext.Provider>
  );
};

export const useGameHost = () => useContext(GameHostContext);
export default GameHostProvider;