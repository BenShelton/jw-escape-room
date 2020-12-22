import { React, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Countdown, { zeroPad } from "react-countdown";
import moment from "moment";
import { AllHtmlEntities as Entities } from "html-entities";

// import "normalize.css/normalize.css";
import "../styles/main.sass";

import { useGame } from "../contexts/GameContext";
// import CMSApi from "../classes/CMSApi";

const entities = new Entities();

const Counter = ({ days, hours, minutes, seconds, completed }) => (
  <div className="invitation__countdown">
    <ul className="invitation__countdown__wrapper">
      <li>
        <p className="invitation__countdown__value">{zeroPad(days)}</p>
        <p className="invitation__countdown__label">Days</p>
      </li>
      <li>
        <p className="invitation__countdown__value">{zeroPad(hours)}</p>
        <p className="invitation__countdown__label">Hours</p>
      </li>
      <li>
        <p className="invitation__countdown__value">{zeroPad(minutes)}</p>
        <p className="invitation__countdown__label">Minutes</p>
      </li>
      <li>
        <p className="invitation__countdown__value">{zeroPad(seconds)}</p>
        <p className="invitation__countdown__label">Seconds</p>
      </li>
    </ul>
  </div>
);

const Invitation = ({ game, room, msg }) => (
  <div className="invitation">
    <div className="invitation__text">
      <h2>You Are Invited To</h2>
      <h1>{room && entities.decode(room.title)}</h1>
      <h2>Hosted by {game && game.host.name}</h2>
    </div>

    <div className="invitation__counter-container">
      <p className="invitation__date">
        {game &&
          moment
            .unix(game.scheduledTime.seconds)
            .format("MMMM Do, YYYY [at] h:mm a")}
      </p>
      <Countdown
        date={moment.unix(game.scheduledTime.seconds).toDate()}
        renderer={props => <Counter {...props} />}
      />
    </div>
  </div>
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
          return setScreen("enter");
          // scheduled time has passed, ask for name
        }
        if (entered === true) {
          return setScreen("waiting");
        }
        return setScreen("invite");
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

  const getScreen = screenToRender => {
    switch (screenToRender) {
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

  return (
    <main
      className="game"
      style={{ backgroundImage: `url(${room.coverImage("full")})` }}
    >
      {room.hasVideo && (
        <video
          autoPlay
          loop
          muted
          className="game__intro-video"
          id="js-intro-video"
          src="http://jwer.brotherapp.org/wp-content/uploads/2020/12/Storm-16160.mp4"
        ></video>
      )}
      <div className="game__screen">{getScreen(screen)}</div>
    </main>
  );
};

export default Game;
