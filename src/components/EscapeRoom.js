import React from "react";
import Countdown, { zeroPad } from "react-countdown";
import moment from "moment";
import SearchIcon from "@material-ui/icons/Search";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import "animate.css/animate.min.css";

import { useGame } from "../contexts/EscapeRoomContext";

const Timer = ({ hours, minutes, seconds, completed }) => (
  <ul className="escaperoom__timer">
    {hours > 0 && (
      <li>
        <p className="escaperoom__timer__value">{zeroPad(hours)}</p>
        <p className="escaperoom__timer__label">Hours</p>
      </li>
    )}
    <li>
      <p className="escaperoom__timer__value">{zeroPad(minutes)}</p>
      <p className="escaperoom__timer__label">Minutes</p>
    </li>
    <li>
      <p className="escaperoom__timer__value">{zeroPad(seconds)}</p>
      <p className="escaperoom__timer__label">Seconds</p>
    </li>
  </ul>
);

const EscapeRoom = () => {
  return (
    <div className="escaperoom">
      <header className="escaperoom__header">
        <div className="escaperoom__header__meta">
          <h1>Julian</h1>
          <h2>The Escape to Noah's Ark</h2>
          <h3>1 / 8</h3>
        </div>
        <div className="escaperoom__header__timer">
          <Countdown
            date={moment()
              .add(60.1, "minutes")
              // .add(45, "minutes")
              .toDate()}
            renderer={props => <Timer {...props} />}
            overtime={true}
          />
        </div>
      </header>

      <div className="escaperoom__challenge-container">
        <div className="escaperoom__challenge">
          <article className="escaperoom__challenge__content">
            <p>
              It is 7am on Friday and about 30 minutes ago we received a text
              message from Brother Smith, our group overseer. He asked us to
              prepare a presentation based on a video from our Teaching Toolbox.
              He also said it is very important to meet for field service on
              Saturday morning because he is giving an announcement. He sent a
              picture of the video we should prepare with. From the excitement,
              I don’t remember which video. What is the video?
            </p>
            <img
              src="https://jwer.brotherapp.org/wp-content/uploads/2020/12/kit.jpeg"
              alt="Brother reading scripture to interested one in service."
            />
          </article>

          {true && (
            <p className="escaperoom__clue animate__animated animate__backInDown">
              Look in the book of Revelations.
            </p>
          )}

          <div id="escaperoom-questions" className="escaperoom__questions">
            <form className="jw">
              <div className="escaperoom__questions__row">
                <label>What is the name of this video?</label>
                <input type="text" className="full-width" />
                <p>Please use all caps and no spaces.</p>
              </div>
              <div className="escaperoom__questions__row">
                <label>What is the name of this video?</label>
                <input
                  type="text"
                  className="animate__animated animate__rubberBand error full-width"
                />
              </div>
            </form>
            {false && (
              <div className="escaperoom__questions__nonleader">
                <h3>Help your team answer the following questions:</h3>
                <ol>
                  <li>What is the name of this video?</li>
                  <li>
                    Which is the title of the video in your teaching toolbox?
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="escaperoom__controls">
        <button
          disabled={true}
          className="escaperoom__button escaperoom__button--clue"
        >
          <span className="escaperoom__button__label">Get a Clue (-2 min)</span>
          <SearchIcon className="escaperoom__button__icon" fontSize="small" />
        </button>
        <button className="escaperoom__button escaperoom__button--unlock">
          <span className="escaperoom__button__label">Unlock</span>
          <LockOpenIcon className="escaperoom__button__icon" fontSize="small" />
        </button>
      </div>
    </div>
  );
};

export default EscapeRoom;
