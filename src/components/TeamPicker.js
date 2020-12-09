import React from "react";
import useDrop from "react-dnd";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";
// import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";

import { Draggable, Droppable } from "react-simple-drag-n-drop";

const useStyles = makeStyles(theme => ({
  teamGroup: {
    background: "#eee",
    padding: "20px",
    borderRadius: "10px",
    margin: "10px 0"
  }
}));

const TeamPicker = ({ players, numberOfTeams }) => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.teamGroup}>
        <h4>Unassigned Players</h4>
        <Draggable id="ddf" isDragAndDropElement={true}>
          <Chip spacing={1} avatar={<Avatar>J</Avatar>} label="Levy" />
        </Draggable>
        <Draggable id="asdf" isDragAndDropElement={true}>
          <Chip
            spacing={1}
            avatar={<ScreenShareIcon></ScreenShareIcon>}
            label="Julian"
          />
        </Draggable>
      </div>
      <div className={classes.teamGroup}>
        <h4>Drop box</h4>
        <Droppable isDragAndDropElement={true}>
          <div style={{ minHeight: "300px" }}></div>
        </Droppable>
      </div>
    </>
  );
};

export default TeamPicker;
