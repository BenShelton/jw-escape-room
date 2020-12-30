import "date-fns";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";
import moment from "moment";
import firebase from "firebase/app";
import Snackbar from "@material-ui/core/Snackbar";
import _ from "lodash";

import db from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { render } from "../helpers/utils";

const GameDialog = ({ open, game, close, setGames, games }) => {
  const dateFormat = "YYYY-MM-DD[T]HH:mm";

  const [selectedDateAndTime, setSelectedDateAndTime] = useState();
  const [escapeRooms, setEscapeRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [message, setMessage] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [newGame, setNewGame] = useState("");

  const { currentUser } = useAuth();

  useEffect(() => console.log(selectedDateAndTime), [selectedDateAndTime]);

  const loadGame = game => {
    setSelectedDateAndTime(
      moment.unix(game.scheduledTime.seconds).format(dateFormat)
    );
    setMessage(game.message || "");
    setSelectedRoom(game.room);
  };

  const reset = () => {
    setSelectedDateAndTime(
      moment()
        .add(1, "day")
        .format(dateFormat)
    );
    setSelectedRoom("");
    setMessage("");
  };

  useEffect(() => {
    const initData = async () => {
      // get all escape rooms
      const allRooms = await db.collection("rooms").get();
      let rooms = [];
      allRooms.forEach(doc => rooms.push(doc.data()));
      setEscapeRooms(rooms);
    };
    initData();
  }, []);

  useEffect(() => {
    // load in game data
    if (game) {
      loadGame(game);
    } else {
      reset();
    }
  }, [game]);

  const handleDialogClose = () => {
    close();
  };

  const handleSnackBarClose = () => {
    setSnackbarMessage("");
  };

  const handleUpdateGame = async () => {
    const gameObj = {
      scheduledTime: firebase.firestore.Timestamp.fromDate(
        moment(selectedDateAndTime, dateFormat).toDate()
      ),
      message,
      room: selectedRoom,
      host: db.doc(`users/${currentUser.uid}`)
    };
    // use loaded game id to overwrite or null for new game
    const gameRef = db.collection("games");

    if (game) {
      await gameRef.doc(game.id).update(gameObj);
      // update game in state
      const oldGameObj = _.find(games, ["id", game.id]);
      const newGameObj = { ...oldGameObj, ...gameObj };
      setGames(prevState =>
        prevState.map(g => (g.id === game.id ? newGameObj : g))
      );
      setNewGame(newGameObj);
      setSnackbarMessage("Your game has been updated");
    } else {
      const { id } = await gameRef.add(gameObj);
      // add game to state
      setGames(prevState => prevState.concat(gameObj));
      setNewGame({ id, ...gameObj });
      setSnackbarMessage("Your game has been created.");
    }
    handleDialogClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          {game ? "Edit Game" : "Create A Game"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {game
              ? "Edit game details here."
              : "Your custom game link will be provided after creation."}
          </DialogContentText>
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl>
                  <InputLabel id="room-selector">Room</InputLabel>
                  <Select
                    labelId="room-selector"
                    value={selectedRoom}
                    onChange={e => setSelectedRoom(e.target.value)}
                  >
                    {escapeRooms.map(({ title, slug }) => (
                      <MenuItem key={slug} value={slug}>
                        {render(title)}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Some important helper text</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Message"
                  multiline
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  fullWidth={true}
                />
              </Grid>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid item xs={12}>
                  <TextField
                    id="datetime-local"
                    label="Time and Date"
                    type="datetime-local"
                    value={selectedDateAndTime}
                    fullWidth={true}
                    onChange={e => setSelectedDateAndTime(e.target.value)}
                  />
                </Grid>
              </MuiPickersUtilsProvider>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdateGame} color="primary">
            {game ? "Update Game" : "Create Game"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={Boolean(snackbarMessage)}
        onClose={handleSnackBarClose}
        message={snackbarMessage}
        autoHideDuration={5000}
        action={
          <Button
            component={Link}
            to={`/games/${newGame.id}`}
            color="secondary"
            size="small"
            onClick={handleSnackBarClose}
          >
            View
          </Button>
        }
      ></Snackbar>
    </>
  );
};

export default GameDialog;
