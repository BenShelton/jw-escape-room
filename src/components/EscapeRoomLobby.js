import { React, useState, useEffect, useRef, useLayoutEffect } from "react";
import Countdown, { zeroPad } from "react-countdown";
import moment from "moment";
import { Helmet } from "react-helmet";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import CircularProgress from "@material-ui/core/CircularProgress";
import { CSSTransition } from "react-transition-group";
import ReactGA from "react-ga";

// import "normalize.css/normalize.css";
import "../styles/main.sass";
import { render } from "../helpers/utils";
import { useGame } from "../contexts/EscapeRoomContext";
import EscapeRoom from "./EscapeRoom";
import EscapeRoomShowcase from "./EscapeRoomShowcase";
import EscapeRoomInformation from "./EscapeRoomInformation";
import ZoomCredentials from "./ZoomCredentials";
import Pulse from "./Pulse";

const Counter = ({ days, hours, minutes, seconds, completed, game }) => (
  <div className="invitation__countdown">
    <p className="invitation__date">
      {game &&
        moment
          .unix(game.scheduledTime.seconds)
          .format("MMMM Do, YYYY [at] h:mm a")}
    </p>
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

const Invitation = ({ game, room, msg }) => {
  const [passedStartTime, setPassedStartTime] = useState(false);

  useEffect(() => {
    // assure that the time has not already passed on load
    if (moment().isAfter(moment.unix(game.scheduledTime.seconds))) {
      setPassedStartTime(true);
    }
  }, []);

  return (
    <div className="invitation">
      <div className="invitation__text">
        <h2>You Are Invited To</h2>
        <h1>{render(room.title)}</h1>
        <h2>Hosted by {`${game.host.firstName} ${game.host.lastName}`}</h2>
      </div>

      <div className="invitation__counter-container">
        <CSSTransition
          timeout={475}
          in={passedStartTime === false}
          unmountOnExit={true}
          classNames="invitation__countdown-"
          appear
        >
          <Countdown
            date={
              // process.env.REACT_APP_FB_ENV === "development"
              //   ? moment()
              //       .add("5", "seconds")
              //       .toDate()
              //   :
              moment.unix(game.scheduledTime.seconds).toDate()
            }
            renderer={props => <Counter game={game} {...props} />}
            onComplete={() => setPassedStartTime(true)}
          />
        </CSSTransition>
        <CSSTransition
          timeout={1450}
          in={passedStartTime}
          classNames="invitation__zoom-credentials-"
        >
          <div
            className={`invitation__zoom-credentials ${
              !game.meeting.id ? "invitation__zoom-credentials--empty" : ""
            }`}
          >
            {game.meeting.id && (
              <>
                <Pulse type="active" className="invitation__zoom-pulse" />
                <ZoomCredentials meeting={game.meeting} />
              </>
            )}
            {!game.meeting.id && (
              <p>
                Contact your host{" "}
                {`${game.host.firstName} ${game.host.lastName}`} for information
                on how to connect to the team.
              </p>
            )}
          </div>
        </CSSTransition>
      </div>
    </div>
  );
};

const Enter = ({ currentPlayer, enterPlayer, setEntered, setScreen }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (currentPlayer && currentPlayer.displayName) {
      setName(currentPlayer.displayName);
    }
  }, [currentPlayer]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (name === "") return;
    enterPlayer(name); // removed await to help with responsiveness after clicking button
    setEntered(true);
    setScreen("waiting:host");
  };

  return (
    <div className="game__screen__enter">
      <div className="game__screen__enter__inner">
        <form className="jw" noValidate onSubmit={handleSubmit}>
          <label htmlFor="player-name-input">Enter your name</label>
          <p className="game__screen__enter__hint">
            please use your same name you are under in the meeting
          </p>
          <div className="game__screen__enter__input-row">
            <input
              autoComplete="name"
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
              <ChevronRightIcon style={{ color: "#9c27b0" }} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Waiting = ({ text, subtext, children }) => (
  <div className="game__screen__waiting">
    <div className="game__screen__waiting__inner">
      <p className="game__screen__waiting__heading">
        {text || "waiting for host"}
      </p>
      {subtext ? (
        <p
          className="game__screen__waiting__subtext"
          dangerouslySetInnerHTML={{ __html: subtext }}
        ></p>
      ) : (
        <p className="game__screen__waiting__subtext">
          Please keep this window open, do not use the back button or refresh
          the page.
        </p>
      )}
      {children}
      <CircularProgress style={{ color: "#fff" }} />
    </div>
  </div>
);

const Completed = () => {
  return (
    <Waiting
      text="Great Job!"
      subtext="The other teams are still finishing up. Sit tight, please keep this window open, the host will reveal the winner soon!"
    ></Waiting>
  );
};

const EscapeRoomLobby = props => {
  const {
    game,
    room,
    stage,
    currentPlayer,
    enterPlayer,
    currentTeam,
    leader,
    completedGame
  } = useGame();
  const [entered, setEntered] = useState(false);
  const [screen, setScreen] = useState("");

  const videoBackgroundRef = useRef();

  // OPTIMIZE: implement loading screen to disapear when video loads
  // useLayoutEffect(() => {
  //   if (room && room.videoBackground) {
  //     videoBackgroundRef.current.addEventListener("loadeddata", () => {
  //       console.log("LOADED DATA");
  //     });
  //   }
  // }, []);

  useEffect(() => {
    // GA log room visit
    ReactGA.event({
      category: "Escape Room",
      action: "Visited invitation screen",
      label: room.title
    });
  }, []);

  useEffect(() => {
    console.log("Completed GAME", completedGame);
    if (completedGame === true) {
      setScreen("waiting:completed");
    }
  }, [completedGame]);

  /**
   * Listen to stage change and map stage to screen
   */
  useEffect(() => {
    console.log(`Deciding screen on stage ${stage}`);
    switch (stage) {
      case "dormant":
        return setScreen("invite");
      case "collecting":
        return setScreen("enter");
      case "dividing":
        return setScreen("waiting:teams");
      case "ready":
        return setScreen("waiting:startgame");
      case "playing":
        return setScreen("play");
      case "finishing":
        return setScreen("waiting:calculating");
      case "final":
        return setScreen("showcase");
      default:
        return setScreen("loading");
    }
  }, [stage]);

  const getScreen = screenToRender => {
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
      case "waiting:completed":
        return <Completed />;
      case "waiting:calculating":
        return <Waiting text="Determining winners" />;
      case "showcase":
        return <EscapeRoomShowcase />;
      default:
        return <Waiting text="Loading" />;
    }
  };

  return (
    <main
      className={`game ${
        stage !== "dormant" ? "game--in-play" : ""
      } game--stage--${currentTeam && currentTeam.endTime ? "dormant" : stage}`}
      style={{ backgroundImage: `url(${room.intro.background})` }}
    >
      <Helmet>
        <title>{`${render(room.title)} - Virtual Escape Room`}</title>
      </Helmet>
      {stage !== "playing" && stage !== "final" && <EscapeRoomInformation />}
      {room.videoBackground && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="game__intro-video"
          id="js-intro-video"
          src={room.videoBackground}
          preload="auto"
          ref={videoBackgroundRef}
        ></video>
      )}
      <div className="game__screen">{getScreen(screen)}</div>
      <div className="game__overlay"></div>
    </main>
  );
};

export default EscapeRoomLobby;
