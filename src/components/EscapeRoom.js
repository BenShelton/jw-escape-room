import React, { useEffect, useState, useRef } from "react";
import Countdown, { zeroPad } from "react-countdown";
import moment from "moment";
import SearchIcon from "@material-ui/icons/Search";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import { Helmet } from "react-helmet";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import "animate.css/animate.min.css";

import { render } from "../helpers/utils";
import { useGame } from "../contexts/EscapeRoomContext";

const Timer = ({ hours, minutes, seconds, completed }) => {
  const { playingChallenge } = useGame();

  return (
    <ul
      className={`escaperoom__timer ${
        completed
          ? "escaperoom__timer--completed animate__animated animate__heartBeat"
          : ""
      } ${
        playingChallenge === "outro"
          ? "escaperoom__timer--finished animate__animated animate__bounceOutUp"
          : ""
      }`}
    >
      {hours > 0 && (
        <li>
          <p className="escaperoom__timer__value">
            {completed && "-"}
            {zeroPad(hours)}
          </p>
          <p className="escaperoom__timer__label">Hours</p>
        </li>
      )}
      <li>
        <p className="escaperoom__timer__value">
          {completed && !hours && "-"}
          {zeroPad(minutes)}
        </p>
        <p className="escaperoom__timer__label">Minutes</p>
      </li>
      <li>
        <p className="escaperoom__timer__value">{zeroPad(seconds)}</p>
        <p className="escaperoom__timer__label">Seconds</p>
      </li>
    </ul>
  );
};

const EscapeRoom = () => {
  const {
    room,
    currentPlayer,
    startTime,
    leader,
    checkAnswers,
    playingChallenge,
    nextChallenge,
    setClue,
    usedClues,
    currentTeam,
    setCompletedGame
  } = useGame();

  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [gameEndtime, setGameEndtime] = useState();

  const formRef = useRef();

  const handleUnlock = () => formRef.current.dispatchEvent(new Event("submit")); // use dispatch event in order to call onSubmit handler

  useEffect(() => {
    // calculate end time with start time and clues
    const twoMinuteDeductions = usedClues.length * 120; // 120 seconds for 2 minutes each clue
    const calculatedEndTime =
      startTime + room.duration * 60 - twoMinuteDeductions;
    console.log("Calulated end time", calculatedEndTime);
    setGameEndtime(calculatedEndTime);
  }, [usedClues]);

  useEffect(() => {
    if (!playingChallenge) return;
    switch (playingChallenge) {
      case "intro":
        setChallenge({ id: "intro", ...room.intro });
        break;
      case "outro":
        setChallenge({ id: "outro", ...room.outro });
        break;
      default:
        setChallenge({
          id: playingChallenge,
          ...room.challenges[playingChallenge]
        });
    }
    setLoadingChallenge(false);
  }, [playingChallenge]);

  const inputName = index => `index-${index}`;

  const addError = inputEl => {
    inputEl.classList.add("error");
    inputEl.classList.add("animate__animated");
    inputEl.classList.add("animate__shakeX");
  };

  const removeError = inputEl => {
    inputEl.classList.remove("error");
    inputEl.classList.remove("animate__animated");
    inputEl.classList.remove("animate__shakeX");
  };

  const handleClue = async e => {
    await setClue();
  };

  // FIXME: this is pretty much the only barrier and check
  // for the correct answers, this should be made less obvious
  // and utlize md5 hash
  const handleSubmit = e => {
    e.preventDefault();
    e.persist();
    // no need to check
    if (playingChallenge === "intro" || playingChallenge === "outro") {
      setLoadingChallenge(true);
      return nextChallenge();
    }
    // get submissions and clear errors
    const submissions = [];
    for (let i = 0; i < challenge.questions.length; i++) {
      const input = e.target[inputName(i)];
      submissions.push(input.value);
      removeError(input);
    }
    const wrongAnswers = checkAnswers(submissions);
    if (wrongAnswers.length) {
      return wrongAnswers.forEach(index => {
        setTimeout(() => addError(e.target[inputName(index)]), 0);
      });
    }
    setLoadingChallenge(true);
    nextChallenge();
  };

  const handleNonLeaderFinish = () => {
    setCompletedGame(true);
  };

  const getChallengeTracker = () => {
    switch (playingChallenge) {
      case "intro":
        return "Introduction";
      case "outro":
        return "Complete";
      default:
        return `${room.challengeMap.indexOf(playingChallenge) + 1} / ${
          room.challengeMap.length
        }`;
    }
  };

  return (
    <div className="escaperoom">
      <Helmet>
        <title>{room && `${room.title} - ${getChallengeTracker()}`}</title>
      </Helmet>
      <header className="escaperoom__header">
        <div className="escaperoom__header__meta">
          <h1>{currentTeam.name}</h1>
          <h2>{render(room.title)}</h2>
          <h3>{getChallengeTracker()}</h3>
        </div>
        <div className="escaperoom__header__timer">
          {gameEndtime && (
            <Countdown
              date={moment.unix(gameEndtime).toDate()}
              renderer={props => <Timer {...props} />}
              overtime={true}
            />
          )}
        </div>
      </header>

      <div className="escaperoom__challenge-container">
        <div className="escaperoom__challenge">
          {challenge && (
            <>
              <SwitchTransition mode="out-in">
                <CSSTransition
                  key={challenge.id}
                  addEndListener={(node, done) =>
                    node.addEventListener("transitionend", done, false)
                  }
                  classNames="escaperoom__challenge__content-"
                >
                  <article
                    className="escaperoom__challenge__content"
                    dangerouslySetInnerHTML={{ __html: challenge.content }}
                  ></article>
                </CSSTransition>
              </SwitchTransition>
              {usedClues.includes(playingChallenge) && (
                <p
                  className="escaperoom__clue animate__animated animate__backInDown"
                  dangerouslySetInnerHTML={{ __html: challenge.clue }}
                ></p>
              )}
              <SwitchTransition mode="out-in">
                <CSSTransition
                  key={challenge.id}
                  addEndListener={(node, done) =>
                    node.addEventListener("transitionend", done, false)
                  }
                  timeout={10000}
                  classNames="escaperoom__questions-"
                >
                  <div
                    id="escaperoom-questions"
                    className="escaperoom__questions"
                  >
                    {leader.id === currentPlayer.uid && (
                      <form
                        className="jw"
                        onSubmit={handleSubmit}
                        ref={formRef}
                      >
                        {challenge.questions &&
                          challenge.questions.map(
                            ({ question, hint }, index) => (
                              <div
                                key={index}
                                className="escaperoom__questions__row"
                              >
                                <label>{question}</label>
                                <input
                                  autoFocus
                                  autoComplete="off"
                                  autoFill="off"
                                  name={inputName(index)}
                                  type="text"
                                  className="full-width"
                                />
                                <p
                                  dangerouslySetInnerHTML={{ __html: hint }}
                                ></p>
                              </div>
                            )
                          )}
                      </form>
                    )}
                    {leader.id !== currentPlayer.uid && challenge.questions && (
                      <div className="escaperoom__questions__nonleader">
                        <h3>
                          Help your team answer the following question
                          {challenge.questions.length > 1 && "s"}:
                        </h3>
                        <ol>
                          {challenge.questions.map(({ question }) => (
                            <li>{question}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </CSSTransition>
              </SwitchTransition>
            </>
          )}
        </div>
        {leader.id === currentPlayer.uid && (
          <div className="escaperoom__controls">
            {typeof playingChallenge === "number" && (
              <button
                type="button"
                onClick={handleClue}
                disabled={
                  usedClues.includes(playingChallenge) && challenge.clue !== ""
                }
                className="escaperoom__button escaperoom__button--clue"
              >
                <div class="escaperoom__button-inner">
                  <span className="escaperoom__button__label">
                    Get a Clue <br /> (-2 min)
                  </span>
                  <SearchIcon
                    className="escaperoom__button__icon"
                    fontSize="small"
                  />
                </div>
              </button>
            )}
            {challenge && (
              <SwitchTransition mode="out-in">
                <CSSTransition
                  key={challenge.id}
                  addEndListener={(node, done) =>
                    node.addEventListener("transitionend", done, false)
                  }
                  classNames="escaperoom__button--unlock-"
                >
                  <button
                    type="submit"
                    className="escaperoom__button escaperoom__button--unlock"
                    onClick={handleUnlock}
                  >
                    <div className="escaperoom__button-inner">
                      <span className="escaperoom__button__label">
                        {typeof playingChallenge === "number"
                          ? "Unlock"
                          : "Next"}
                      </span>
                      {typeof playingChallenge === "number" ? (
                        <LockOpenIcon
                          className="escaperoom__button__icon"
                          fontSize="small"
                        />
                      ) : (
                        <NavigateNextIcon
                          className="escaperoom__button__icon"
                          fontSize="small"
                        />
                      )}
                    </div>
                  </button>
                </CSSTransition>
              </SwitchTransition>
            )}
          </div>
        )}
        {leader.id !== currentPlayer.uid && playingChallenge === "outro" && (
          <div className="escaperoom__controls">
            <button
              type="button"
              className="escaperoom__button escaperoom__button--unlock escaperoom__button--positive"
              onClick={handleNonLeaderFinish}
            >
              <div className="escaperoom__button-inner">
                <span className="escaperoom__button__label">Finish</span>

                <NavigateNextIcon
                  className="escaperoom__button__icon"
                  fontSize="small"
                />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscapeRoom;
