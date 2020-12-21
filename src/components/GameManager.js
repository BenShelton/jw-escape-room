import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import _ from "lodash";

import { useGameHost } from "../contexts/GameHostContext";
import Block from "./Block";
import { sharedStyles } from "../theme";
import { rdb } from "../firebase";

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

const GameManager = () => {
  const { teams, players } = useGameHost();

  const [populatedTeams, setPopulatedTeams] = useState([]);

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
    </Block>
  );
};

export default GameManager;
