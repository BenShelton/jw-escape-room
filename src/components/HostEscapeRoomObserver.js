import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import _ from "lodash";

import { useGameHost } from "../contexts/GameHostContext";
import Block from "./Block";
import { sharedStyles } from "../theme";
import { rdb, functions } from "../firebase";

const useStyles = makeStyles(theme => ({
  ...sharedStyles(theme)
}));

const TeamStatus = ({ team }) => {
  const classes = useStyles();

  return (
    <div className={classes.teamGroup}>
      <Typography>
        Players:
        {team.players.map(player =>
          player.leader ? (
            <strong> {player.name} </strong>
          ) : (
            <span> {player.name} </span>
          )
        )}
      </Typography>{" "}
      &nbsp; &nbsp; &nbsp;
      <Typography>Current Challenge: {team.challenge}</Typography>
    </div>
  );
};

const HostEscapeRoomObserver = () => {
  const { teams, players, game, setStage } = useGameHost();

  const [populatedTeams, setPopulatedTeams] = useState([]);

  const handleEndGame = async () => {
    // set stage to "finishing"
    setStage("finishing");
    const endGame = functions.httpsCallable("endGame");
    try {
      await endGame({ gameId: game.id });
    } catch (e) {
      console.error(e);
    }
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

  const buildTeamArray = () =>
    Object.keys(teams).map(id => ({
      id,
      ...teams[id],
      players: getTeamPlayers(id)
    }));

  useEffect(() => {
    setPopulatedTeams(prevState => buildTeamArray());
  }, [teams]);

  return (
    <Block>
      {populatedTeams.length &&
        populatedTeams.map(team => <TeamStatus team={team} />)}
      <Button variant="contained" onClick={handleEndGame}>
        End Game
      </Button>
    </Block>
  );
};

export default HostEscapeRoomObserver;
