import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import _ from "lodash";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import { getChallengeTracker } from "../helpers/utils";
import { useGameHost } from "../contexts/GameHostContext";
import Block from "./Block";
import { sharedStyles } from "../theme";
import { rdb, functions } from "../firebase";

const useStyles = makeStyles(theme => ({
  ...sharedStyles(theme),
  completedRow: {
    backgroundColor: "#d0ffb4"
  }
}));

const TeamStatusTable = ({ teams, room }) => {
  const classes = useStyles();
  console.log("TEAMS", teams);
  console.log("ROOM", room);

  const getAnswers = challenge => {
    const questions = room.challenges[challenge].questions;
    return questions.map(({ answer }) => answer);
  };

  return (
    // <TableContainer component={Paper}>
    <Table aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell>Team</TableCell>
          <TableCell align="right">Leader</TableCell>
          <TableCell align="right">Challenge</TableCell>
          <TableCell align="right">Answers</TableCell>
          <TableCell align="right">Clue</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {teams.map(team => (
          <TableRow
            key={team.id}
            className={
              team.currentChallenge === "outro" ? classes.completedRow : ""
            }
          >
            <TableCell component="th" scope="row">
              {team.name}
            </TableCell>
            <TableCell align="right">{team.leader.name}</TableCell>
            <TableCell align="right">
              {getChallengeTracker({
                playingChallenge: team.currentChallenge,
                room
              })}
            </TableCell>
            <TableCell align="right">
              {team.currentChallenge !== "intro" &&
              team.currentChallenge !== "outro" ? (
                <ol
                  style={{ listStyle: "decimal", listStylePosition: "inside" }}
                >
                  {getAnswers(team.currentChallenge).map(answer => (
                    <li>{answer}</li>
                  ))}
                </ol>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell align="right">
              {team.currentChallenge !== "intro" &&
              team.currentChallenge !== "outro"
                ? room.challenges[team.currentChallenge].clue
                : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    // </TableContainer>
  );
};

const HostEscapeRoomObserver = () => {
  const { teams, players, game, setStage, room } = useGameHost();

  const [populatedTeams, setPopulatedTeams] = useState([]);
  const [finishedTeams, setFinishedTeams] = useState([]);
  const [completedGame, setCompletedGame] = useState(false);

  useEffect(() => {
    setFinishedTeams(() =>
      Object.entries(teams).filter(([id, { currentChallenge }]) => {
        return currentChallenge === "outro";
      })
    );
  }, [teams]);

  const handleEndGame = async () => {
    // set stage to "finishing"
    setStage("finishing");
    const endGame = functions.httpsCallable("endGame");
    try {
      await endGame({ gameId: game.id });
    } catch (e) {
      console.error(e);
    }
    setCompletedGame(true);
  };

  // OPTIMIZE: better algorithm here
  const getTeamPlayers = teamId => {
    const team = teams[teamId];
    const teamPlayers = [];
    Object.keys(players).forEach(playerId => {
      const player = players[playerId];
      if (player.team === teamId) {
        if (playerId === team.leader) {
          return teamPlayers.push({ ...player, leader: true });
        }
        teamPlayers.push(player);
      }
    });
    return teamPlayers;
  };

  const getTeamLeader = players => _.find(players, ["leader", true]);

  const buildTeamArray = () =>
    Object.keys(teams).map(id => {
      const players = getTeamPlayers(id);
      return {
        id,
        ...teams[id],
        players,
        leader: getTeamLeader(players)
      };
    });

  useEffect(() => {
    setPopulatedTeams(prevState => buildTeamArray());
  }, [teams]);

  return (
    <Block>
      <TeamStatusTable
        teams={populatedTeams}
        room={room}
        setFinishedTeams={setFinishedTeams}
      />
      <Button
        variant="contained"
        disabled={
          finishedTeams.length !== populatedTeams.length && !completedGame
        }
        color="primary"
        onClick={handleEndGame}
        style={{ marginTop: "30px" }}
      >
        End Game and Reveal winners
      </Button>
    </Block>
  );
};

export default HostEscapeRoomObserver;
