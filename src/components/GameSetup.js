import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import { sharedStyles } from "../theme";
import TextField from "@material-ui/core/TextField";

import Block from "./Block";
import PickTeamStep from "./PickTeamStep";
import { useGameHost } from "../contexts/GameHostContext";

const useStyles = makeStyles(theme => ({
  ...sharedStyles(theme),
  root: {
    width: "100%"
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  resetContainer: {
    padding: theme.spacing(3)
  },
  chip: {
    margin: "0 5px 0"
  }
}));

export const SetupStep = ({
  label,
  nextText,
  nextHandler,
  children,
  handleReset,
  ...rest
}) => {
  const classes = useStyles();
  return (
    <Step {...rest}>
      <StepLabel>{label}</StepLabel>
      <StepContent>
        {children}
        <div className={classes.actionsContainer}>
          <div>
            <Button variant="contained" color="primary" onClick={nextHandler}>
              {nextText}
            </Button>
            {handleReset && (
              <Button onClick={handleReset} className={classes.button}>
                Reset
              </Button>
            )}
          </div>
        </div>
      </StepContent>
    </Step>
  );
};

const BeginGameStep = ({ ...rest }) => {
  const { game, stage, setStage } = useGameHost();

  const nextHandler = () => {
    // change stage to collecting
    setStage("collecting");
  };

  return (
    <SetupStep
      label="Open Game"
      nextText="Open Game"
      nextHandler={nextHandler}
      {...rest}
    >
      <Typography>
        Opening the game will allow players to enter their name and sign in.
      </Typography>
      <Typography>
        <strong>{`${process.env.REACT_APP_SITE_URL}/play/${game.id}`}</strong>
      </Typography>
    </SetupStep>
  );
};

const PlayerCollectStep = ({ nextStep, setNumberOfTeams, ...rest }) => {
  const classes = useStyles();

  const { players, setStage, gameURL } = useGameHost();

  const setNumberOfTeamsRef = useRef();

  const nextHandler = () => {
    setNumberOfTeams(setNumberOfTeamsRef.current.value);
    // change stage in firebase
    setStage("dividing");
  };

  return (
    <SetupStep
      label="Collect Players"
      nextText="Lock Game"
      nextHandler={nextHandler}
      {...rest}
    >
      <Typography>
        Checked in players will populate here when they go to{" "}
        <strong>{gameURL}</strong> and enter their name.
      </Typography>
      <div className={classes.teamGroup}>
        {players &&
          Object.keys(players).map(id => (
            <Chip
              key={id}
              avatar={<Avatar>{players[id].name[0]}</Avatar>}
              label={players[id].name}
              className={classes.chip}
            />
          ))}
      </div>
      <form noValidate autoComplete="off">
        <TextField
          id="filled-basic"
          label="Number of Teams"
          type="number"
          variant="filled"
          default={1}
          inputProps={{ ref: setNumberOfTeamsRef }}
        />
      </form>
    </SetupStep>
  );
};

const FinishSetupStep = ({ ...rest }) => {
  const { setStage, startGame } = useGameHost();

  const handleReset = () => {
    setStage("dormant");
  };

  return (
    <SetupStep
      label="Review"
      nextText="Let the Games Begin!"
      nextHandler={startGame}
      handleReset={handleReset}
      {...rest}
    >
      <Typography>
        You are now ready to begin the game. Please make sure that all of your
        players have joined their team's breakout room and that each team leader
        is able to share their screen so that the team can work together.
      </Typography>
    </SetupStep>
  );
};

const GameSetup = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState();
  const [numberOfTeams, setNumberOfTeams] = useState(1);

  const { stage } = useGameHost();

  // FIXME: hardcoded and that makes me feel icky. Better way?
  const mapStageToStep = stage =>
    ({ dormant: 0, collecting: 1, dividing: 2, ready: 3, playing: Infinity }[
      stage
    ]);

  useEffect(() => {
    const currentStage = mapStageToStep(stage);
    setActiveStep(currentStage >= 0 ? currentStage : -1);
  }, [stage]);

  // const nextStep = (done = false) => {
  //   // logic based on stage
  //   setActiveStep(prevActiveStep => prevActiveStep + 1);
  //   if (done) {
  //     setComplete(true);
  //   }
  // };

  return (
    <Block>
      <div className={classes.root}>
        <Stepper activeStep={activeStep} orientation="vertical">
          <BeginGameStep />
          <PlayerCollectStep setNumberOfTeams={setNumberOfTeams} />
          <PickTeamStep numberOfTeams={numberOfTeams} />
          <FinishSetupStep />
        </Stepper>
      </div>
    </Block>
  );
};

export default GameSetup;
