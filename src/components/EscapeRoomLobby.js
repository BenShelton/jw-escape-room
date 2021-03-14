import { React, useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import ReactGA from "react-ga";

// import "normalize.css/normalize.css";
import "../styles/main.sass";
import { render } from "../helpers/utils";
import { useGame } from "../contexts/EscapeRoomContext";
import EscapeRoom from "./EscapeRoom";
import EscapeRoomInvitation from "./EscapeRoomInvitation";
import EscapeRoomEnter from "./EscapeRoomEnter";
import EscapeRoomWaiting from "./EscapeRoomWaiting";
import EscapeRoomShowcase from "./EscapeRoomShowcase";
import EscapeRoomInformation from "./EscapeRoomInformation";
import ZoomCredentials from "./ZoomCredentials";
import Pulse from "./Pulse";

// const Completed = () => {
//   return (
//     <Waiting
//       text="Great Job!"
//       subtext="The other teams are still finishing up. Sit tight, please keep this window open, the host will reveal the winner soon!"
//     ></Waiting>
//   );
// };

const EscapeRoomLobby = props => {
  const {
    game,
    room,
    stage,
    currentPlayer,
    enterPlayer,
    currentTeam,
    leader,
    phase
  } = useGame();

  const [RenderComponent, setRenderComponent] = useState();

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

  // useEffect(() => {
  //   if (completedGame === true) {
  //     setScreen("waiting:completed");
  //   }
  // }, [completedGame]);

  const mapPhaseToComponent = phase => {
    console.log("GOT PHASE", phase);
    switch (phase) {
      case "inviting":
        return {
          Component: EscapeRoomInvitation,
          props: { game, room }
        };
      case "entering":
        return {
          Component: EscapeRoomEnter,
          props: { currentPlayer, enterPlayer }
        };
      case "waiting:joined":
        return {
          Component: EscapeRoomWaiting
        };
      case "waiting:teams":
        return {
          Component: EscapeRoomWaiting,
          props: {
            text: "Host is dividing teams"
          }
        };
      case "waiting:ready":
        return {
          Component: EscapeRoomWaiting,
          props: {
            text: "Waiting on host to start game",
            subtext:
              leader.id === currentPlayer.uid
                ? `You are the team leader of <strong>${currentTeam.name}</strong>. Please make sure that you are able to share this screen.`
                : `You are on <strong>${currentTeam.name}</strong> and <strong>${leader.name}</strong> is your team leader.`
          }
        };
      case "playing":
        return {
          Component: EscapeRoom
        };
      case "waiting:completed":
        return {
          Component: EscapeRoomWaiting,
          props: {
            text: "Great Job!",
            subtext:
              "The other teams are still finishing up. Sit tight, please keep this window open, the host will reveal the winner soon!"
          }
        };
      case "waiting:calculating":
        return {
          Component: EscapeRoomWaiting,
          props: {
            text: "Determining winner"
          }
        };
      case "showcase":
        return {
          Component: EscapeRoomShowcase
        };
      default:
        return {
          Component: EscapeRoomInvitation,
          props: {
            late: true
          }
        };
    }
  };

  useEffect(() => {
    const Component = mapPhaseToComponent(phase);
    setRenderComponent(Component);
  }, [phase]);

  /**
   * Listen to stage change and map stage to screen
   */
  // useEffect(() => {
  //   console.log(`Deciding screen on stage ${stage}`);
  //   switch (stage) {
  //     case "dormant":
  //       return setScreen("invite");
  //     case "collecting":
  //       return setScreen("enter");
  //     case "dividing":
  //       return setScreen("waiting:teams");
  //     case "ready":
  //       return setScreen("waiting:startgame");
  //     case "playing":
  //       return setScreen("play");
  //     case "finishing":
  //       return setScreen("waiting:calculating");
  //     case "final":
  //       return setScreen("showcase");
  //     default:
  //       return setScreen("loading");
  //   }
  // }, [stage]);
  //
  // useEffect(() => {
  //   switch (stage) {
  //     case "invite":
  //       return <Invitation room={room} game={game} />;
  //     case "enter":
  //       return (
  //         <Enter
  //           room={room}
  //           game={game}
  //           currentPlayer={currentPlayer}
  //           enterPlayer={enterPlayer}
  //           setEntered={setEntered}
  //           setScreen={setScreen}
  //         />
  //       );
  //     case "waiting:host":
  //       return <Waiting />;
  //     case "waiting:teams":
  //       return <Waiting text="Host is dividing teams" />;
  //     case "waiting:startgame":
  //       return (
  //         <>
  //           {leader && (
  //             <Waiting
  //               text="Waiting on host to start game"
  //               subtext={
  //                 leader.id === currentPlayer.uid
  //                   ? `You are the team leader of <strong>${currentTeam.name}</strong>. Please make sure that you are able to share this screen.`
  //                   : `You are on <strong>${currentTeam.name}</strong> and <strong>${leader.name}</strong> is your team leader.`
  //               }
  //             />
  //           )}
  //         </>
  //       );
  //     case "loading":
  //       return <Waiting text="Loading" />;
  //     case "play":
  //       return <EscapeRoom />;
  //     case "waiting:completed":
  //       return <Completed />;
  //     case "waiting:calculating":
  //       return <Waiting text="Determining winners" />;
  //     case "showcase":
  //       return <EscapeRoomShowcase />;
  //     default:
  //       return <Waiting text="Loading" />;
  //   }
  // }, [stage]);

  return (
    <main
      className={`game ${
        stage !== "dormant" ? "game--in-play" : ""
      } game--stage--${currentTeam && currentTeam.endTime ? "dormant" : stage}`}
      style={{ backgroundImage: `url(${room.intro.background})` }}
    >
      {RenderComponent && (
        <>
          <Helmet>
            <title>{`${render(room.title)} - Virtual Escape Room`}</title>
          </Helmet>
          {stage !== "playing" && stage !== "final" && (
            <EscapeRoomInformation />
          )}
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
          <div className="game__screen">
            {/* <SwitchTransition>
              <CSSTransition
                key={RenderComponent.Component}
                // addEndListener={(node, done) =>
                //   node.addEventListener("transitionend", done, false)
                // }
                timeout={3000}
                classNames="view-transition-"
              > */}
            <RenderComponent.Component {...RenderComponent.props} />
            {/* </CSSTransition>
            </SwitchTransition> */}
          </div>
          <div className="game__overlay"></div>
        </>
      )}
    </main>
  );
};

export default EscapeRoomLobby;
