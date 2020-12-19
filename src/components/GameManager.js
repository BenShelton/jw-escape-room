import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import { useGameHost } from "../contexts/GameHostContext";
import Block from "./Block";
import { sharedStyles } from "../theme";
import { rdb } from "../firebase";

const useStyles = makeStyles(theme => ({
  ...sharedStyles(theme)
}));

const TeamStatus = ({ team }) => {
  const classes = useStyles();
  const { players } = useGameHost();

  return (
    <div className={classes.teamGroup}>
      <Typography>
        Players:
        {Object.keys(players).map(id => {
          const { name, team: teamId } = players[id];
          if (teamId === team.id) {
            return id === team.leader ? (
              <strong> {name} </strong>
            ) : (
              <span> {name} </span>
            );
          }
        })}
      </Typography>
    </div>
  );
};

const GameManager = ({}) => {
  const [teams, setTeams] = useState({});

  const { teamsRef } = useGameHost();

  useEffect(() => {
    // FIXME: this should be gotten from current state
    // but it has to be mutated die to poor design
    // get teams from rdb
    teamsRef.once("value", snapshot => setTeams(snapshot.val()));
    teamsRef.on("child_changed", snapshot =>
      setTeams(prevState => ({
        ...prevState,
        [snapshot.getRef().getKey()]: snapshot.val()
      }))
    );
  }, []);

  return (
    <Block>
      {Object.keys(teams).map(teamId => (
        <TeamStatus team={{ id: teamId, ...teams[teamId] }} />
      ))}
    </Block>
  );
};

export default GameManager;
