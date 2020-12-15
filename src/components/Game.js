import { React, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Countdown, { zeroPad } from "react-countdown";
import moment from "moment";

import { useGame } from "../contexts/GameContext";
// import CMSApi from "../classes/CMSApi";

const Invitation = ({ game, room, msg }) => (
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
    <Countdown
      date={moment.unix(game.scheduledTime.seconds).toDate()}
      renderer={({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
          return <p>done</p>;
        } else {
          return (
            <p>
              {zeroPad(days)} : {zeroPad(hours)} : {zeroPad(minutes)} :{" "}
              {zeroPad(seconds)}
            </p>
          );
        }
      }}
    />
  </>
);

const Enter = ({ currentPlayer, enterPlayer, setEntered }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState();

  useEffect(() => {
    if (currentPlayer.displayName) {
      setName(currentPlayer.displayName);
    }
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    await enterPlayer(name);
    setEntered(true);
  };

  return (
    <form onSubmit={handleSubmit} action="">
      <label>Please enter your name</label>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        required
        name="player-name"
        type="text"
      />
    </form>
  );
};

const Waiting = () => <p>Waiting for Host</p>;

const Game = props => {
  let { game, room, stage, currentPlayer, enterPlayer } = useGame();
  let [entered, setEntered] = useState(false);
  let [screen, setScreen] = useState("");

  useEffect(() => {
    // determine stage of local app
    switch (stage) {
      case "dormant":
        if (moment().isAfter(moment.unix(game.scheduledTime.seconds))) {
          // scheduled time has passed, ask for name
          return setScreen("invite");
        }
        if (entered === true) {
          return setScreen("waiting");
        }
        return setScreen("enter");
      case "collecting":
        if (entered === true) {
          // player already chose name
          return setScreen("waiting");
        }
        return setScreen("enter");
      default:
        return setScreen("waiting");
    }
  }, [stage]);

  switch (screen) {
    case "invite":
      return <Invitation room={room} game={game} setScreen={setScreen} />;
    case "enter":
      return (
        <Enter
          room={room}
          game={game}
          currentPlayer={currentPlayer}
          enterPlayer={enterPlayer}
          setEntered={setEntered}
        />
      );
    case "waiting":
      return <Waiting />;

    default:
      return <Waiting />;
  }
};

export default Game;
