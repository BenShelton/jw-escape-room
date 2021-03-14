import React, { useState, useLayoutEffect } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import countdownSound from "../sounds/countdown.mp3";

const EscapeRoomStartCountdown = ({ onComplete }) => {
  const [start, setStart] = useState(false);
  const [complete, setComplete] = useState(false);

  const onCompleteBuffer = 1000;

  const soundEffect = new Audio(countdownSound);

  const handleOnComplete = () => {
    setComplete(true);
    setTimeout(() => {
      onComplete();
    }, onCompleteBuffer);
  };

  useLayoutEffect(() => {
    soundEffect.play();
    setTimeout(() => {
      setStart(true);
    }, 2000);
  }, []);

  return (
    <div className="escaperoom-countdown">
      <div
        className={`escaperoom-countdown__curtain ${
          start ? "escaperoom-countdown__curtain--close" : ""
        }`}
      ></div>
      <CSSTransition
        appear
        in={!complete}
        timeout={onCompleteBuffer}
        classNames="escaperoom-countdown__inner-"
      >
        <div className="escaperoom-countdown__inner">
          <CountdownCircleTimer
            isPlaying={start}
            duration={10}
            colors="#fff"
            onComplete={handleOnComplete}
          >
            {({ remainingTime }) => (
              <TransitionGroup>
                <CSSTransition
                  key={remainingTime}
                  classNames="escaperoom-countdown__number-"
                  timeout={300}
                >
                  <p className="escaperoom-countdown__number">
                    {remainingTime}
                  </p>
                </CSSTransition>
              </TransitionGroup>
            )}
          </CountdownCircleTimer>
        </div>
      </CSSTransition>
    </div>
  );
};

export default EscapeRoomStartCountdown;
