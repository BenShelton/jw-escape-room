import React, { useEffect, useState } from "react";
import useDrop from "react-dnd";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";
// import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import Grid from "@material-ui/core/Grid";
import { nanoid } from "nanoid";
import _ from "lodash";
import Alert from "@material-ui/lab/Alert";

import { SetupStep } from "./GameSetup";
import { useGameHost } from "../contexts/GameHostContext";

const useStyles = makeStyles(theme => ({
  teamGroup: {
    background: "#eee",
    padding: "20px",
    borderRadius: "10px",
    margin: "10px 0"
  },
  chipContainer: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  chip: {
    margin: "5px"
  }
}));

const PickTeamStep = ({ numberOfTeams, ...rest }) => {
  const classes = useStyles();

  const { players, writeTeams, setStage } = useGameHost();
  // players = { adfasdf : {name: Julian}, sdhasdf: {name: Levy} }

  const [unassignedPlayers, setUnassignedPlayers] = useState([]);
  const [dividedTeams, setDividedTeams] = useState({});

  const [error, setError] = useState("");

  useEffect(() => {
    let teamsObj = {};
    for (let i = 0; i < numberOfTeams; i++) {
      teamsObj[nanoid()] = [];
    }
    setDividedTeams(teamsObj);
  }, [numberOfTeams]);

  useEffect(() => {
    const flattenedPlayers = Object.keys(players).map(id => ({
      id,
      name: players[id].name
    }));
    setUnassignedPlayers(prevState => [...flattenedPlayers]);
  }, [players]);

  const nextHandler = async () => {
    if (unassignedPlayers.length) {
      return setError(`Please assign all players to a team.`);
    }
    // loop through all teams to check for team leader
    const teamObjs = Object.values(dividedTeams);
    for (let i = 0; i < teamObjs.length; i++) {
      const leader = _.find(teamObjs[i], ["leader", true]);
      if (!leader) {
        return setError("Please assign a team leader to all teams.");
      }
    }
    // store teams in ledger
    await writeTeams(dividedTeams);
    setStage("ready");
  };

  const handleUnassign = (playerId, teamId) => {
    setDividedTeams(prevState => ({
      ...prevState,
      [teamId]: prevState[teamId].filter(({ id }) => id !== playerId)
    }));
    setUnassignedPlayers(prevState =>
      prevState.concat({ id: playerId, name: players[playerId].name })
    );
  };

  const handleAssign = (playerId, teamId) => {
    setUnassignedPlayers(prevState =>
      prevState.filter(({ id }) => id !== playerId)
    );
    // assign to correct team
    setDividedTeams(prevState => ({
      ...prevState,
      [teamId]: prevState[teamId].concat({
        id: playerId,
        name: players[playerId].name
      })
    }));
  };

  const assignLeader = (playerId, teamId) => {
    setDividedTeams(prevState => ({
      ...prevState,
      [teamId]: prevState[teamId].map(player => {
        if (player.id === playerId) {
          return { ...player, leader: true };
        }
        delete player.leader;
        return player;
      })
    }));
  };

  return (
    <SetupStep
      label="Divide Teams"
      nextText="Lock Teams"
      nextHandler={nextHandler}
      {...rest}
    >
      <div className={classes.teamGroup}>
        <p>Unassigned Players</p>
        <div className={classes.chipContainer}>
          {unassignedPlayers.map(({ name, id }) => (
            <Chip
              key={id}
              avatar={<Avatar>{name[0]}</Avatar>}
              label={name}
              className={classes.chip}
            />
          ))}
        </div>
      </div>
      <Grid container spacing={3}>
        {Object.keys(dividedTeams).map((teamId, index) => (
          <Grid key={teamId} item xs>
            <div className={classes.teamGroup}>
              <p>{`Team ${index + 1}`}</p>
              <div className={classes.chipContainer}>
                {dividedTeams[teamId].map(player => (
                  <Chip
                    key={player.id}
                    icon={player.leader && <ScreenShareIcon />}
                    avatar={!player.leader && <Avatar>{player.name[0]}</Avatar>}
                    label={player.name}
                    className={classes.chip}
                    onClick={() => assignLeader(player.id, teamId)}
                    onDelete={() => handleUnassign(player.id, teamId)}
                    color={player.leader && "secondary"}
                  />
                ))}
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const input = e.target[`value-${teamId}`];
                  const playerId = input.value;
                  // check if existing player
                  if (!players[playerId]) return;
                  handleAssign(playerId, teamId);
                  input.value = "";
                }}
              >
                <input list="unassigned" name={`value-${teamId}`} />
                <datalist id="unassigned">
                  {unassignedPlayers.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </datalist>
                <input type="submit" value="add" />
              </form>
            </div>
          </Grid>
        ))}
      </Grid>
      {error && <Alert severity="error">{error}</Alert>}
    </SetupStep>
  );
};

export default PickTeamStep;
