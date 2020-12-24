import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import moment from "moment";
import { Link } from "react-router-dom";
import _ from "lodash";
import { AllHtmlEntities as Entities } from "html-entities";

import Title from "./Title";
import db from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import HostBase, { useStyles } from "./HostBase";
import GameSetup from "./GameSetup";
import Block from "./Block";

const entities = new Entities();

const GameList = () => {
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
    // get room names
    // for (var i = 0; i < gameObjs.length; i++) {
    //   const slug = gameObjs[i].room;
    //   if (!roomNames[slug]) {
    //     const res = await CMSApi.getRoom(slug, ["title"]);
    //     roomNames[slug] = res.title.rendered;
    //     console.log("name", res.title.rendered);
    //   }
    //   gameObjs[i].room = roomNames[slug];
    // }
    setGames(gameObjs);
  };

  useEffect(() => {
    getGames();
  }, []);

  return (
    // OPTIMIZE: add edit and delete button
    <List>
      {games.map(game => (
        <ListItem
          key={game.id}
          component={Link}
          to={`/games/${game.id}`}
          button
        >
          <ListItemText
            primary={rooms && entities.decode(rooms[game.room.id])}
            secondary={moment
              .unix(game.scheduledTime.seconds)
              .format("MMMM Do, YYYY")}
          />
        </ListItem>
      ))}
    </List>
  );
};

const HostGame = ({}) => (
  <HostBase>
    <Grid item xs={12}>
      <GameList />
    </Grid>
  </HostBase>
);

export default HostGame;
