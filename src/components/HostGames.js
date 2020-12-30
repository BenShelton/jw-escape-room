import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import moment from "moment";
import { Link } from "react-router-dom";
import { AllHtmlEntities as Entities } from "html-entities";
import Paper from "@material-ui/core/Paper";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import Snackbar from "@material-ui/core/Snackbar";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import _ from "lodash";

import Title from "./Title";
import db from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import HostBase from "./HostBase";
import GameDialog from "./GameDialog";
import { sharedStyles } from "../theme";

const entities = new Entities();

const useStyles = makeStyles(theme => ({
  ...sharedStyles(theme),
  fab: {
    position: "fixed",
    bottom: "30px",
    right: "30px"
  }
}));

const DeleteGameDialog = ({ game, setGames, open, close }) => {
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleDelete = async () => {
    await db
      .collection("games")
      .doc(game.id)
      .delete();
    setGames(prevState => prevState.filter(({ id }) => id !== game.id));
    setSnackbarMessage("Game has been deleted");
    close();
  };

  const handleSnackBarClose = () => setSnackbarMessage("");

  return (
    <>
      <Dialog
        open={open}
        onClose={close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you would like to delete this game scheduled for
            {game &&
              " " +
                moment
                  .unix(game.scheduledTime.seconds)
                  .format("MMMM Do, YYYY [at] h:mm a")}
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} color="primary">
            No
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={Boolean(snackbarMessage)}
        onClose={handleSnackBarClose}
        message={snackbarMessage}
        autoHideDuration={5000}
        // OPTIMIZE: add undo action. If so better to
        // make context to share create game function
      ></Snackbar>
    </>
  );
};

const GameList = ({ openGameDialog, games, rooms, setGames }) => {
  const classes = useStyles();

  const selectedGameInit = {
    anchorEl: null,
    game: null
  };

  const [sortedGames, setSortedGames] = useState([]);
  const [pendingDeletion, setPendingDeletion] = useState(false);
  const [selectedGame, setSelectedGame] = useState(selectedGameInit);

  const handleMenuClose = () => setSelectedGame(selectedGameInit);

  const handleGameOptions = (game, anchorEl) => {
    setSelectedGame({ game, anchorEl });
  };

  const closeDialog = () => {
    setPendingDeletion(false);
  };

  const handleEditGame = () => {
    openGameDialog(selectedGame.game);
    handleMenuClose();
  };

  const handleDeleteGame = () => {
    setPendingDeletion(true);
    // OPTIMIZE: close simple here, but next event relies on it
  };

  useEffect(() => {
    // sort by date in ascending order
    setSortedGames(_.sortBy(games, ["scheduledTime.seconds"]));
  }, [games]);

  return (
    // OPTIMIZE: add edit and delete button
    <>
      <Paper className={classes.paper}>
        <Title>Escape Rooms</Title>
        <List>
          {sortedGames.map(game => (
            <ListItem
              key={game.id}
              component={Link}
              to={`/games/${game.id}`}
              button
            >
              <ListItemText
                primary={rooms && entities.decode(rooms[game.room])}
                secondary={moment
                  .unix(game.scheduledTime.seconds)
                  .format("MMMM Do, YYYY [at] h:mm")}
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={e => handleGameOptions(game, e.currentTarget)}
                  aria-label="edit"
                >
                  <MoreHorizIcon />
                </IconButton>
                {/* <IconButton
                  onClick={() => openGameDialog(game)}
                  aria-label="edit"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => setPendingDeletion(game)}
                  edge="end"
                  aria-label="delete"
                >
                  <DeleteIcon />
                </IconButton> */}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Menu
          anchorEl={selectedGame.anchorEl}
          keepMounted
          open={Boolean(selectedGame.anchorEl)}
          onClose={handleMenuClose}
        >
          {/* OPTIMIZE: add button icons */}
          <MenuItem onClick={handleEditGame}>Edit</MenuItem>
          <MenuItem onClick={handleDeleteGame}>Delete</MenuItem>
        </Menu>
      </Paper>
      <DeleteGameDialog
        open={pendingDeletion}
        game={selectedGame.game}
        setGames={setGames}
        close={closeDialog}
      />
    </>
  );
};

const HostGame = () => {
  const classes = useStyles();

  const [openDialog, setOpenDialog] = useState(false);
  const [editGame, setEditGame] = useState();
  const [games, setGames] = useState([]);
  const [rooms, setRooms] = useState([]);

  const { currentUser } = useAuth();

  const getGames = async () => {
    const hostRef = db.collection("users").doc(currentUser.uid);
    const gameSnapshots = await db
      .collection("games")
      .where("host", "==", hostRef)
      .get();
    const gameObjs = [];
    gameSnapshots.forEach(doc => {
      const gameData = { ...doc.data(), id: doc.id };
      gameObjs.push(gameData);
    });
    // get rooms
    const foundRooms = await db.collection("rooms").get();
    foundRooms.forEach(doc =>
      setRooms(prevState => ({
        ...prevState,
        [doc.id]: doc.data().title
      }))
    );
    setGames(gameObjs);
  };

  useEffect(() => {
    getGames();
  }, []);

  const openGameDialog = game => {
    setOpenDialog(true);
    setEditGame(game || null);
  };

  const closeGameDialog = () => {
    setOpenDialog(false);
    setEditGame(null);
  };

  return (
    <HostBase>
      <Grid item xs={12}>
        <Container maxWidth="lg">
          <GameList
            rooms={rooms}
            games={games}
            setGames={setGames}
            openGameDialog={openGameDialog}
          />
        </Container>
      </Grid>
      <GameDialog
        open={openDialog}
        close={closeGameDialog}
        game={editGame}
        games={games}
        setGames={setGames}
      />
      <Fab
        className={classes.fab}
        onClick={() => setOpenDialog(true)}
        color="primary"
        aria-label="add"
      >
        <AddIcon />
      </Fab>
    </HostBase>
  );
};

export default HostGame;
