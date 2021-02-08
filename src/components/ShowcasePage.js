import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import Lottie from "lottie-react";
import "animate.css/animate.min.css";

import drumrollSound from "../sounds/drumroll.mp3";
import winSound from "../sounds/win.mp3";
import fireworksAnimation from "../data/lottie/fireworks.json";
import confettiAnimation from "../data/lottie/confetti.json";
import goldMedalAnimation from "../data/lottie/goldMedal.json";

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

const ShowcasePage = () => {
  const [rankings, setRankings] = useState([
    {
      name: "The Isrealites",
      endTime: { seconds: 1612193663 }, // 35 minutes
      usedClues: [16, 19], // -4 minutes
      leader: "Bill"
    },
    {
      name: "The Jebusites",
      endTime: { seconds: 1612193303 }, // 29 minutes
      usedClues: [16] // -2 minutes
    },
    {
      name: "The Levites",
      endTime: { seconds: 1612194263 }, // 45 minutes
      usedClues: []
    }
  ]);
  const [startTime, setStartTime] = useState({ seconds: 1612191563 });

  const [teams, setTeams] = useState({
    team1: {
      name: "The Isrealites",
      endTime: { seconds: 1612193663 }, // 35 minutes
      usedClues: [16, 19] // -4 minutes
    },
    team2: {
      name: "The Jebusites",
      endTime: { seconds: 1612193303 }, // 29 minutes
      usedClues: [16] // -2 minutes
    },
    team3: {
      name: "The Levites",
      endTime: { seconds: 1612194263 }, // 45 minutes
      usedClues: []
    }
  });

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
    runAnimation();
  }, []);

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
          {rankings.map((team, i) => (
            <li
              className={`showcase__winners showcase__winners--${mapIndexToClass(
                i
              )}`}
              ref={mapIndexToRef(i)}
              key={i}
            >
              {i === 0 && (
                <Lottie
                  lottieRef={medalRef}
                  className="showcase__medal"
                  loop={true}
                  animationData={goldMedalAnimation}
                />
              )}
              <p className="showcase__rank">
                <Rank index={i} /> Place
              </p>
              <p
                className={`showcase__name ${
                  announceWinner ? "animate__animated animate__tada" : ""
                }`}
              >
                {team.name}
              </p>
              <p className="showcase__stats">
                <strong>35</strong> minutes /{" "}
                <strong>{team.usedClues.length}</strong> clue
                {team.usedClues.length > 1 || team.usedClues.length === 0
                  ? "s"
                  : ""}
              </p>
              <p className="showcase__leader">
                Led by {team.leader || "Julian"}
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
                    <li className="showcase__current-player">Julian</li>
                    <li>Jesus</li>
                    <li>Moses</li>
                    <li>Nebachadnezzar</li>
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
        <ul className="showcase_ranks"></ul>
      </div>
    </div>
  );
};

export default ShowcasePage;
