import { React, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";

import db from "../firebase";
import CMSApi from "../classes/CMSApi";

const GameWelcomePage = props => {
  let { gameId } = useParams();

  const [game, setGame] = useState(null);
  const [room, setRoom] = useState(null);
  // const [error, setError] = useState("");

  useEffect(() => {
    let tempGame = null;

    db.collection("games")
      .doc(gameId)
      .get()
      .then(docSnapshot => {
        if (!docSnapshot.exists) {
          throw new Error(`Invalid game id ${gameId}.`);
        }
        tempGame = docSnapshot.data();
        console.log("game", tempGame);
        // update game state
        setGame(tempGame);
        // query for host
        return db
          .collection("users")
          .doc(tempGame.host.id)
          .get();
      })
      .then(hostSnapshot => {
        if (!hostSnapshot.exists) {
          throw new Error(`Host with id ${game.host.id} not found.`);
        }
        console.log("host", hostSnapshot.data());
        setGame(prevState => {
          tempGame = { ...prevState, host: hostSnapshot.data() };
          return tempGame;
        });
        return CMSApi.findRoom(tempGame.room);
      })
      .then(room => {
        console.log("room", room);
        // get room details from CMS
        if (!room) {
          // TODO: update UI with this error
          console.error(`Room with slug ${tempGame.room} not found`);
        }
        setRoom(room);
      });
  }, []);

  // useEffect(() => console.log(room), [room]);

  return (
    <>
      <p>You're Invited to</p>
      <p>{room && room.title}</p>
      <p>Hosted by {game && game.host.name}</p>
      {room && <img alt="" src={room.coverImage("thumbnail")} />}
      <p>
        {game &&
          moment
            .unix(game.scheduledTime.seconds)
            .format("MMMM Do, YYYY [at] h:mm a")}
      </p>
    </>
  );
};

export default GameWelcomePage;
