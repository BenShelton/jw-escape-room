import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import _ from "lodash";

import db, { auth, rdb } from "../firebase";

const EscapeRoomContext = React.createContext();

function EscapeRoomProvider({ children }) {
  const [currentPlayer, setCurrentPlayer] = useState();
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(null);
  const [room, setRoom] = useState();
  const [error, setError] = useState("");
  const [stage, setStage] = useState("");
  const [teams, setTeams] = useState();
  const [players, setPlayers] = useState();
  const [currentTeam, setCurrentTeam] = useState();
  const [startTime, setStartTime] = useState();
  const [leader, setLeader] = useState();
  const [activeLeavePrompt, setActiveLeavePrompt] = useState(false);
  // const [completedStages, setCompletedStages] = useState([]);
  const [pendingStage, setPendingStage] = useState();
  // challenge state
  const [remainingChallenges, setRemainingChallenges] = useState([]);
  const [playingChallenge, setPlayingChallenge] = useState();
  const [usedClues, setUsedClues] = useState([]);
  const [finalRankings, setFinalRankings] = useState();
  const [completedGame, setCompletedGame] = useState(false);

  let { gameId } = useParams();

  const stages = [
    "dormant",
    "collecting",
    "dividing",
    "ready",
    "playing",
    "finishing",
    "final"
  ];

  const mapStageToTask = stage =>
    ({
      dormant: dormantTasks,
      collecting: collectingTasks,
      dividing: dividingTasks,
      ready: readyTasks,
      playing: playingTasks,
      finishing: finishingTasks,
      final: finalTasks
    }[stage]);

  // OPTIMIZE: this could be written better
  // const getNeededTasks = stage => {
  //   let useBaton = false;
  //   const taskFunctions = [];
  //   if (completedStages.length !== stages.indexOf(stage)) {
  //     // stages out of sync run needed tasks
  //     useBaton = true;
  //     const tasksNeeded = stages
  //       .slice(0, stages.indexOf(stage) === 0 ? 1 : stages.indexOf(stage) + 1)
  //       .map(mapStageToTask);
  //     taskFunctions.push(...tasksNeeded);
  //   } else {
  //     taskFunctions.push(mapStageToTask(stage));
  //   }
  //   return { tasks: taskFunctions, useBaton };
  // };

  useEffect(() => {
    const runTasks = async stage => {
      const task = mapStageToTask(stage);
      console.log("The task at hand", task);
      await task();
      console.log("Task finished");
      // switch (stage) {
      //   case "dormant":
      //     await dormantTasks();
      //     break;
      //   case "collecting":
      //     await collectingTasks();
      //     break;
      //   case "dividing":
      //     await dividingTasks();
      //     break;
      //   case "ready":
      //     await readyTasks();
      //     break;
      //   default:
      //     console.log(`No function for ${stage}`);
      // }
      setStage(pendingStage);
      setLoading(false);
    };
    if (!pendingStage) return;
    console.log("Received pending stage", pendingStage);
    runTasks(pendingStage);
  }, [pendingStage]);

  /**
   * Make sure that all necessary
   * information is gathered at each stage
   */
  useEffect(() => {
    // const runTasks = async (tasks, useBaton) => {
    //   const baton = {}; // hold return of last function to pass to next
    //   for (let i = 0; i < tasks.length; i++) {
    //     console.log("Running task " + i, tasks[i].name);
    //     await tasks[i](baton);
    //   }
    //   setLoading(false);
    // };
    // on initial render subscribe to game stage
    rdb.ref(`er-games/${gameId}/stage`).on("value", snapshot => {
      console.log(
        "==========STAGE CHANGE==========\n",
        "Stage " + snapshot.val()
      );
      console.log("Stage from database", snapshot.val());
      setPendingStage(snapshot.val());
    });
  }, []);

  const listenToTeams = () =>
    new Promise((resolve, reject) => {
      rdb.ref(`er-teams/${gameId}`).on("value", snapshot => {
        setTeams(snapshot.val());
        resolve(snapshot.val());
      });
    });

  const listenToPlayers = () =>
    new Promise((resolve, reject) => {
      rdb.ref(`er-players/${gameId}`).on("value", snapshot => {
        setPlayers(snapshot.val());
        resolve(snapshot.val());
      });
    });

  const listenToCurrentTeam = teamId =>
    new Promise((resolve, reject) => {
      rdb.ref(`er-teams/${gameId}/${teamId}`).on("value", snapshot => {
        setCurrentTeam({ ...snapshot.val(), id: teamId });
        resolve({ ...snapshot.val(), id: teamId });
      });
    });

  const dormantTasks = async function(baton) {
    console.log('Running "dormant" tasks');
    const gameData = await findGame(gameId);
    await findRoom(gameData.room);
    // baton.room = roomData;
    // baton.game = gameData;
  };

  const collectingTasks = async baton => {
    console.log('Runnning "collecting" tasks');
    // at this point we want to the user to stay on the page
    setActiveLeavePrompt(true);
    // check in user if not already
    const initPlayer = () =>
      new Promise((resolve, reject) => {
        auth.onAuthStateChanged(player => {
          if (player) {
            console.log("Setting player", player);
            setCurrentPlayer(player);
            return resolve(player);
          }
          console.log("Checking in player");
          checkIn();
        });
      });
    const player = await initPlayer();
    // baton.player = player;
  };

  const dividingTasks = () => {
    console.log('Running "dividing" tasks');
  };

  // OPTIMIZE: unsubscribe from listeners when game over
  const readyTasks = async baton => {
    console.log('Running "ready" tasks');
    console.log("Current player here", currentPlayer);
    // subscribe to teams
    const initialTeams = await listenToTeams();
    // subscribe to players
    const initialPlayers = await listenToPlayers();
    // set players team
    const teamId = initialPlayers[currentPlayer.uid].team;
    setCurrentPlayer(prevState => ({ ...prevState, team: teamId }));
    // if (baton.player) {
    //   baton.player.team = teamId;
    // }
    // set team in state
    setCurrentTeam({ ...initialTeams[teamId], id: teamId });
    // baton.currentTeam = { ...initialTeams[teamId], id: teamId };
    // set leader
    setLeader({
      ...initialPlayers[initialTeams[teamId].leader],
      id: initialTeams[teamId].leader
    });
    // baton.leader = {
    //   ...initialPlayers[initialTeams[teamId].leader],
    //   id: initialTeams[teamId].leader
    // };
    // set listener on team
    await listenToCurrentTeam(teamId);
  };

  const playingTasks = async () => {
    console.log(`Running "playingTasks"`);
    // clone challenges into remaining challenges
    setRemainingChallenges(_.clone(room.challengeMap));
    // get start time
    await new Promise((resolve, reject) => {
      rdb.ref(`er-games/${gameId}/startTime`).once("value", snapshot => {
        setStartTime(snapshot.val());
        resolve(snapshot.val());
      });
    });
    setPlayingChallenge("intro");
  };

  const finishingTasks = () => {
    console.log('Running "finishingTasks"');
  };

  const finalTasks = async () => {
    console.log('Running "finalTasks"');
    // get final rankings
    await rdb.ref(`er-rankings/${gameId}`).once("value", snapshot => {
      setFinalRankings(snapshot.val());
    });
  };

  /**
   * Check for leader update on team update
   */
  useEffect(() => {
    if (!currentTeam || !players) return;
    const leader = players[currentTeam.leader];
    setLeader({ ...leader, id: currentTeam.leader });
  }, [currentTeam]);

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
  }, [activeLeavePrompt]);

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
    if (!foundRoom.exists) {
      return setError(`Room with slug ${slug} not found in firestore`);
    }
    setRoom(foundRoom.data());
    return foundRoom.data();
  };

  /**
   * Enter player into game ledger
   * @param  {String}  displayName User display name
   * OPTIMIZE: this could be a lot simpler if name was
   * simply added to ledger and not to auth object
   */
  const enterPlayer = async displayName => {
    await currentPlayer.updateProfile({ displayName });
    const unsubscribeAuth = await new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(async player => {
        console.log("Entering player", player);
        setCurrentPlayer(player);
        // enter user into ledger
        await rdb.ref(`er-players/${gameId}/${player.uid}`).set({
          name: player.displayName
        });
        resolve(unsubscribe);
      });
    });
    unsubscribeAuth();
  };

  const nextChallenge = async () => {
    if (currentTeam.currentChallenge === "outro") {
      setCompletedGame(true);
    }
    if (!remainingChallenges.length) {
      return rdb
        .ref(`er-teams/${gameId}/${currentTeam.id}/currentChallenge`)
        .set("outro");
    }
    return rdb
      .ref(`er-teams/${gameId}/${currentTeam.id}/currentChallenge`)
      .set(remainingChallenges[0]);
  };

  const checkAnswers = submissions => {
    console.log("Submissions", submissions);
    const answers = _.map(
      room.challenges[playingChallenge].questions,
      "answer"
    );
    const wrong = [];
    answers.forEach((answer, i) =>
      submissions[i] !== answer ? wrong.push(i) : null
    );
    return wrong;
  };

  const setClue = async () => {
    // enter challenge id into team ledger
    await rdb
      .ref(`er-teams/${gameId}/${currentTeam.id}/usedClues`)
      .once("value")
      .then(snapshot => {
        return rdb
          .ref(`er-teams/${gameId}/${currentTeam.id}/usedClues`)
          .set(
            _.uniq([
              ...(snapshot.exists() ? snapshot.val() : []),
              playingChallenge
            ])
          );
      });
  };

  const endGame = () => {
    if (leader.id === currentPlayer.uid) {
      rdb
        .ref(`er-teams/${gameId}/${currentTeam.id}/endTime`)
        .set(moment().unix());
    }
  };

  window.skipToEnd = () => {
    setRemainingChallenges([]);
    rdb
      .ref(`er-teams/${gameId}/${currentTeam.id}/currentChallenge`)
      .set("outro");
  };

  // listen to team's current challenge
  useEffect(() => {
    if (currentTeam && currentTeam.currentChallenge) {
      // remove from remaining challenges
      setRemainingChallenges(prevState =>
        prevState.filter(c => c !== currentTeam.currentChallenge)
      );
      setPlayingChallenge(currentTeam.currentChallenge);
      console.log(
        `Setting playingChallenge to ${currentTeam.currentChallenge}`
      );
      if (currentTeam.currentChallenge === "outro") {
        endGame();
      }
    }
    if (currentTeam && currentTeam.usedClues) {
      setUsedClues(currentTeam.usedClues);
    }
  }, [currentTeam]);

  const value = {
    currentPlayer,
    game,
    room,
    stage,
    enterPlayer,
    teams,
    players,
    startTime,
    leader,
    currentTeam,
    remainingChallenges,
    playingChallenge,
    nextChallenge,
    checkAnswers,
    setClue,
    usedClues,
    finalRankings,
    completedGame,
    setCompletedGame
  };

  return (
    <EscapeRoomContext.Provider value={value}>
      {error && <p>{error}</p>}
      {!loading && children}
    </EscapeRoomContext.Provider>
  );
}

export const useGame = () => useContext(EscapeRoomContext);
export default EscapeRoomProvider;
