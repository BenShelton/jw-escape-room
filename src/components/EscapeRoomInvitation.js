import { React, useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import Countdown, { zeroPad } from "react-countdown";
import moment from "moment";

import Pulse from "./Pulse";
import { render } from "../helpers/utils";
import ZoomCredentials from "./ZoomCredentials";

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

const EscapeRoomInvitation = ({ game, room, late }) => {
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
          in={!passedStartTime && !late}
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
          in={passedStartTime || late}
          classNames="invitation__zoom-credentials-"
        >
          <div
            className={`invitation__zoom-credentials ${
              !game.meeting.id ? "invitation__zoom-credentials--empty" : ""
            }
            ${late ? "invitation__zoom-credentials--late" : ""}`}
          >
            {game.meeting.id && !late && (
              <>
                <Pulse type="active" className="invitation__zoom-pulse" />
                <ZoomCredentials meeting={game.meeting} />
              </>
            )}
            {!game.meeting.id && !late && (
              <p>
                Contact your host{" "}
                {`${game.host.firstName} ${game.host.lastName}`} for information
                on how to connect to the team.
              </p>
            )}
            {late && (
              <p>
                Uh oh. It looks like this game already started. It was scheduled
                for {moment.unix(game.scheduledTime.seconds).format("h:mm a")}.
              </p>
            )}
          </div>
        </CSSTransition>
      </div>
    </div>
  );
};

export default EscapeRoomInvitation;
