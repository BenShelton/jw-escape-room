import { React, useState, useEffect } from "react";
import Countdown, { zeroPad } from "react-countdown";
import moment from "moment";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import CircularProgress from "@material-ui/core/CircularProgress";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";

// import "normalize.css/normalize.css";
import "../styles/main.sass";
import InfoModal from "./InfoModal";
import { render, isVideo } from "../helpers/utils";
import { useGame } from "../contexts/EscapeRoomContext";
import EscapeRoom from "./EscapeRoom";
import EscapeRoomShowcase from "./EscapeRoomShowcase";

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
      <h1>{room && render(room.title)}</h1>
      <h2>
        Hosted by {game && `${game.host.firstName} ${game.host.lastName}`}
      </h2>
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

const Enter = ({ currentPlayer, enterPlayer, setEntered, setScreen }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState();

  useEffect(() => {
    if (currentPlayer && currentPlayer.displayName) {
      setName(currentPlayer.displayName);
    }
  }, [currentPlayer]);

  const handleSubmit = async e => {
    e.preventDefault();
    await enterPlayer(name);
    setEntered(true);
    setScreen("waiting:host");
  };

  return (
    <div className="game__screen__enter">
      <div className="game__screen__enter__inner">
        <form className="jw" noValidate onSubmit={handleSubmit}>
          <label htmlFor="player-name-input">enter your name</label>
          <div className="game__screen__enter__input-row">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              id="player-name-input"
              name="player-name"
              type="text"
            />
            <button
              className={`submit ${name.length ? "submit--show" : ""}`}
              type="submit"
            >
              <ChevronRightIcon style={{ color: "#00dbff" }} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Waiting = ({ text, subtext }) => (
  <div className="game__screen__waiting">
    <div className="game__screen__waiting__inner">
      <p className="game__screen__waiting__heading">
        {text || "waiting for host"}
      </p>
      {subtext && (
        <p
          className="game__screen__waiting__subtext"
          dangerouslySetInnerHTML={{ __html: subtext }}
        ></p>
      )}
      <CircularProgress style={{ color: "#fff" }} />
    </div>
  </div>
);

const EscapeRoomLobby = props => {
  let {
    game,
    room,
    stage,
    currentPlayer,
    enterPlayer,
    getTeams,
    currentTeam,
    leader
  } = useGame();
  let [entered, setEntered] = useState(false);
  let [screen, setScreen] = useState("");
  let [team, setTeam] = useState();
  const [openModal, setOpenModal] = useState(false);

  // listen here for when team completes all challenges
  // get current time and write to team
  // mark completed in team ledger
  // if the stage is not "final" move set screen to waiting with team's final stats
  // on stage final bring to victory page

  /**
   * Listen to stage change and map stage to screen
   */
  useEffect(() => {
    console.log(`Deciding screen on stage ${stage}`);
    switch (stage) {
      case "dormant":
        if (moment().isAfter(moment.unix(game.scheduledTime.seconds))) {
          return setScreen("enter");
          // scheduled time has passed, ask for name
        }
        if (entered === true) {
          return setScreen("waiting:host");
        }
        return setScreen("invite");
      case "collecting":
        if (entered === true) {
          // player already chose name
          return setScreen("waiting:host");
        }
        return setScreen("enter");
      case "dividing":
        return setScreen("waiting:teams");
      case "ready":
        return setScreen("waiting:startgame");
      case "playing":
        return setScreen("play");
      case "final":
        return setScreen("showcase");
      default:
        return setScreen("loading");
    }
  }, [stage]);

  const getScreen = screenToRender => {
    // OPTIMIZE: add countdown animation screen before start https://codepen.io/nw/pen/zvQVWM
    console.log(`Rendering screen ${screenToRender}`);
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
            setScreen={setScreen}
          />
        );
      case "waiting:host":
        return <Waiting />;
      case "waiting:teams":
        return <Waiting text="Host is dividing teams" />;
      case "waiting:startgame":
        return (
          <>
            {leader && (
              <Waiting
                text="Waiting on host to start game"
                subtext={
                  leader.id === currentPlayer.uid
                    ? `You are the team leader of <strong>${currentTeam.name}</strong>. Please make sure that you are able to share this screen.`
                    : `You are on <strong>${currentTeam.name}</strong> and <strong>${leader.name}</strong> is your team leader.`
                }
              />
            )}
          </>
        );
      case "loading":
        return <Waiting text="Loading" />;
      case "play":
        return <EscapeRoom />;
      case "showcase":
        return <EscapeRoomShowcase />;
      default:
        return <Waiting text="Loading" />;
    }
  };

  return (
    <main
      className={`game ${stage !== "dormant" ? "game--in-play" : ""}`}
      style={room && { backgroundImage: `url(${room.intro.background})` }}
    >
      <InfoModal
        title="A Message From Your Host"
        message="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque in suscipit eros, et tincidunt leo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec in ipsum eget orci varius porttitor in sit amet magna. Sed nec egestas magna. Praesent posuere a libero eu dictum. Nam cursus interdum elit id dapibus."
        meetingId="215 400 0468"
        meetingPass="JWFUN"
        open={openModal}
        setOpen={setOpenModal}
      ></InfoModal>
      {room && room.outro.background.type === "video" && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="game__intro-video"
          id="js-intro-video"
          src={room.outro.background.url}
        ></video>
      )}
      <div className="game__screen">
        <button
          className="game__info-toggle"
          onClick={() => {
            setOpenModal(true);
          }}
        >
          <InfoOutlinedIcon />
        </button>
        {getScreen(screen)}
      </div>
      <div className="game__overlay"></div>
    </main>
  );
};

export default EscapeRoomLobby;
