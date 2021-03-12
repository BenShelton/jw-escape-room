import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import Lottie from "lottie-react";
import moment from "moment";
import "animate.css/animate.min.css";
import { CSSTransition } from "react-transition-group";

import CheckIcon from "@material-ui/icons/Check";
import drumrollSound from "../sounds/drumroll.mp3";
import winSound from "../sounds/win.mp3";
import fireworksAnimation from "../data/lottie/fireworks.json";
import confettiAnimation from "../data/lottie/confetti.json";
import goldMedalAnimation from "../data/lottie/goldMedal.json";
import { useGame } from "../contexts/EscapeRoomContext";
import EscapeRoomSignoff from "./EscapeRoomSignoff";

const Rank = ({ index }) => {
  switch (index) {
    case 0:
      return (
        <>
          1<sup>st</sup>
        </>
      );
    case 1:
      return (
        <>
          2<sup>nd</sup>
        </>
      );
    case 2:
      return (
        <>
          3<sup>rd</sup>
        </>
      );
    default:
      return null;
  }
};

const ShowcaseStats = ({ team }) => {
  const minutes = moment.duration(team.netDuration, "seconds").get("minutes");
  const seconds = moment.duration(team.netDuration, "seconds").get("seconds");

  return (
    <>
      <strong>{minutes}</strong> minute{minutes > 1 ? "s" : ""}
      {seconds > 1 && (
        <span>
          <strong>{` ${seconds}`}</strong> seconds
        </span>
      )}{" "}
      / <strong>{team.usedClues}</strong> clue
      {team.usedClues > 1 || team.usedClues === 0 ? "s" : ""}
    </>
  );
};

const EscapeRoomShowcase = () => {
  const { finalRankings, currentPlayer, players, teams, game } = useGame();

  const [pedestal, setPedestal] = useState([]);
  const [playerMap, setPlayerMap] = useState();
  const [revealShowcase, setRevealShowcase] = useState(false);
  const [mountAnimation, setMountAnimation] = useState(true);

  const finishButton = useRef();

  const handleFinishButton = () => setRevealShowcase(true);

  useEffect(() => {
    // show button after 20 seconds
    setTimeout(() => {
      finishButton.current.classList.add("showcase__finish-button--show");
    }, 19000);
    // enter rankings
    const rankEntries = Object.entries(finalRankings);
    console.log("RANK ENTRIES", rankEntries);
    // hold team data to put on the pedestal
    let toPedestal = null;
    // grab first 3 teams as winners
    toPedestal = rankEntries.slice(0, 3).map(team => team[1]);
    console.log("TO PEDESTAL SLICED", toPedestal);
    // TEMP: take care one team games for testing
    // and enter fake teams
    const missing = 3 - toPedestal.length;
    console.log("MISSING", missing);
    if (missing !== 0) {
      const placeholders = [
        {
          id: "jabahba",
          usedClues: 2,
          currentChallenge: "outro",
          netDuration: 1440,
          name: "Test 1",
          mock: true
        },
        {
          id: "jabahba3",
          usedClues: 1,
          currentChallenge: "outro",
          netDuration: 1380,
          name: "Test 2",
          mock: true
        }
      ];
      for (let i = 0; i < missing; i++) {
        toPedestal.push(placeholders.pop());
      }
    }
    setPedestal(toPedestal);

    // generate player map
    const tempPlayerMap = {};
    Object.entries(players).forEach(([id, playerData]) => {
      const { team, name } = playerData;
      const obj = { team, name };
      if (teams[team].leader === id) {
        obj.leader = true;
      }
      if (!tempPlayerMap[team]) {
        tempPlayerMap[team] = [obj];
      } else {
        tempPlayerMap[team].push(obj);
      }
    });
    setPlayerMap(tempPlayerMap);
  }, []);

  const [announceWinner, setAnnounceWinner] = useState(false);

  const firstPlacePlayers = useRef();
  const secondPlacePlayers = useRef();
  const thirdPlacePlayers = useRef();

  const firstPlace = useRef();
  const secondPlace = useRef();
  const thirdPlace = useRef();

  const overlayRef = useRef();
  const medalRef = useRef();

  const mapIndexToClass = index => ["first", "second", "third"][index];
  const mapIndexToRef = index => [firstPlace, secondPlace, thirdPlace][index];
  const mapIndexToPlayersRef = index =>
    [firstPlacePlayers, secondPlacePlayers, thirdPlacePlayers][index];

  const runAnimation = () => {
    const firstPlaceSound = new Audio(drumrollSound);
    const otherPlaceSound = new Audio(winSound);
    const classes = {
      first: {
        in: "animate__zoomInDown"
      },
      second: {
        in: "animate__zoomInLeft",
        out: "animate__zoomOutRight"
      },
      third: {
        in: "animate__zoomInLeft",
        out: "animate__zoomOutRight"
      }
    };

    // third place
    setTimeout(() => {
      otherPlaceSound
        .play()
        .then(() => console.log("Third place song played"))
        .catch(e => console.error(e));
      thirdPlace.current.classList.add("animate__animated", classes.third.in);
    }, 1000);
    // hide third place
    setTimeout(() => {
      // hide third place
      thirdPlace.current.classList.add("animate__animated", classes.third.out);
    }, 3500);

    // show second place
    setTimeout(() => {
      otherPlaceSound
        .play()
        .then(() => console.log("Second place sound played"))
        .catch(e => console.error(e));

      // show second place
      secondPlace.current.classList.add("animate__animated", classes.second.in);
    }, 4500);

    // hide second place
    setTimeout(() => {
      // hide third place
      secondPlace.current.classList.add(
        "animate__animated",
        classes.second.out
      );
    }, 7500);

    // start drumroll audio
    setTimeout(() => {
      firstPlaceSound
        .play()
        .then(() => console.log("1st place sound played"))
        .catch(e => console.error(e));
      overlayRef.current.classList.add("showcase__overlay--show");
    }, 8500);

    // start reveal animation
    setTimeout(() => {
      firstPlace.current.classList.add("animate__animated", classes.first.in);
    }, 12000);

    setTimeout(() => {
      setAnnounceWinner(true);
      medalRef.current.animationItem.wrapper.classList.add(
        "showcase__medal--show"
      );
    }, 12500);
  };

  useLayoutEffect(() => {
    if (mountAnimation) {
      runAnimation();
    }
  }, []);

  useEffect(() => {
    if (revealShowcase) {
      setTimeout(() => {
        // unmount other components after animation
        setMountAnimation(false);
      }, 1500);
    }
  }, [revealShowcase]);

  const handlePlayersToggle = (e, i) => {
    const { current } = mapIndexToPlayersRef(i);
    const playerOpenClass = "showcase__players--open";
    const buttonOpenClass = "showcase__players-toggle--open";
    if (current.classList.contains(playerOpenClass)) {
      e.target.classList.remove(buttonOpenClass);
      current.classList.remove(playerOpenClass);
    } else {
      e.target.classList.add(buttonOpenClass);
      current.classList.add(playerOpenClass);
    }
  };

  return (
    <>
      {mountAnimation && (
        <div className="showcase">
          <div ref={overlayRef} className="showcase__overlay"></div>
          <div className="showcase__lottie-container">
            {announceWinner && (
              <>
                <Lottie
                  className="showcase__fireworks"
                  loop={true}
                  animationData={fireworksAnimation}
                />
                <Lottie
                  className="showcase__confetti showcase__confetti--left"
                  loop={false}
                  animationData={confettiAnimation}
                />
                <Lottie
                  className="showcase__confetti showcase__confetti--right"
                  loop={false}
                  animationData={confettiAnimation}
                />
              </>
            )}
          </div>
          <div className="showcase__inner">
            <ul className="showcase__top-three">
              {pedestal.length &&
                pedestal.map((team, i) => (
                  <li
                    className={`showcase__winners showcase__winners--${mapIndexToClass(
                      i
                    )}`}
                    ref={mapIndexToRef(i)}
                    key={i}
                  >
                    {console.log("TEAM OBJ", team)}
                    {i === 0 && (
                      <Lottie
                        lottieRef={medalRef}
                        className="showcase__medal"
                        loop={true}
                        animationData={goldMedalAnimation}
                      />
                    )}
                    <div className="showcase__team-info">
                      <p className="showcase__rank">
                        <Rank index={i} /> Place
                      </p>
                      <p
                        className={`showcase__name ${
                          announceWinner
                            ? "animate__animated animate__tada"
                            : ""
                        }`}
                      >
                        {team.name}
                      </p>
                      <p className="showcase__stats">
                        <ShowcaseStats team={team} />
                      </p>
                      <p className="showcase__leader">
                        Led by{" "}
                        {team.mock !== true
                          ? players[teams[team.id].leader].name
                          : ""}
                      </p>
                      {i === 0 && (
                        <>
                          <button
                            onClick={e => handlePlayersToggle(e, i)}
                            className="showcase__players-toggle"
                          >
                            Show Players <KeyboardArrowDownIcon />
                          </button>
                          <ul
                            ref={mapIndexToPlayersRef(i)}
                            className="showcase__players"
                          >
                            {playerMap[team.id].map(player => (
                              <li key={player.id}>{player.name}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
            <ul className="showcase_ranks"></ul>
          </div>
          <button
            ref={finishButton}
            onClick={handleFinishButton}
            className="corner-button showcase__finish-button"
          >
            <div class="corner-button__button-inner">
              <span className="corner-button__label">finish</span>
              <CheckIcon className="corner-button__icon" fontSize="small" />
            </div>
          </button>
        </div>
      )}
      <CSSTransition
        in={revealShowcase}
        timeout={1500}
        classNames="showcase__signoff-"
      >
        <EscapeRoomSignoff
          rankings={Object.entries(finalRankings)}
          currentPlayer={currentPlayer}
          game={game}
          className="showcase__signoff"
        />
      </CSSTransition>
    </>
  );
};

export default EscapeRoomShowcase;
