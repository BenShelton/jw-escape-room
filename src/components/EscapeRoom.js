import React, { useEffect, useState, useRef } from "react";
import Countdown, { zeroPad } from "react-countdown";
import moment from "moment";
import SearchIcon from "@material-ui/icons/Search";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import { Helmet } from "react-helmet";
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
        setChallenge(room.intro);
        break;
      case "outro":
        setChallenge(room.outro);
        break;
      default:
        setChallenge(room.challenges[playingChallenge]);
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

  const getChallengeTracker = () =>
    `${room.challengeMap.indexOf(playingChallenge) + 1} / ${
      room.challengeMap.length
    }`;

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
              onPause={() => console.log("COUNTER PAUSED")}
              // controlled={Boolean(currentTeam.endTime)}
              date={moment.unix(gameEndtime).toDate()}
              renderer={props => <Timer {...props} />}
              overtime={true}
            />
          )}
        </div>
      </header>

      <div className="escaperoom__challenge-container">
        {!loadingChallenge && (
          <div className="escaperoom__challenge">
            <article
              className="escaperoom__challenge__content"
              dangerouslySetInnerHTML={{ __html: challenge.content }}
            ></article>

            {usedClues.includes(playingChallenge) && (
              <p
                className="escaperoom__clue animate__animated animate__backInDown"
                dangerouslySetInnerHTML={{ __html: challenge.clue }}
              ></p>
            )}

            <div id="escaperoom-questions" className="escaperoom__questions">
              {leader.id === currentPlayer.uid && (
                <form className="jw" onSubmit={handleSubmit}>
                  {challenge.questions &&
                    challenge.questions.map(({ question, hint }, index) => (
                      <div key={index} className="escaperoom__questions__row">
                        <label>{question}</label>
                        <input
                          name={inputName(index)}
                          type="text"
                          className="full-width"
                        />
                        <p dangerouslySetInnerHTML={{ __html: hint }}></p>
                      </div>
                    ))}
                  <div className="escaperoom__controls">
                    {typeof playingChallenge === "number" && (
                      <button
                        type="button"
                        onClick={handleClue}
                        disabled={
                          usedClues.includes(playingChallenge) &&
                          challenge.clue !== ""
                        }
                        className="escaperoom__button escaperoom__button--clue"
                      >
                        <span className="escaperoom__button__label">
                          Get a Clue (-2 min)
                        </span>
                        <SearchIcon
                          className="escaperoom__button__icon"
                          fontSize="small"
                        />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="escaperoom__button escaperoom__button--unlock"
                    >
                      <span className="escaperoom__button__label">
                        {typeof playingChallenge === "number"
                          ? "Unlock"
                          : "Next"}
                      </span>
                      {typeof playingChallenge === "number" && (
                        <LockOpenIcon
                          className="escaperoom__button__icon"
                          fontSize="small"
                        />
                      )}
                    </button>
                  </div>
                </form>
              )}
              {leader.id !== currentPlayer.uid && playingChallenge === "outro" && (
                <div className="escaperoom__controls">
                  <button
                    type="submit"
                    className="escaperoom__button escaperoom__button--unlock"
                    onClick={handleNonLeaderFinish}
                  >
                    <span className="escaperoom__button__label">Finish</span>
                  </button>
                </div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default EscapeRoom;
