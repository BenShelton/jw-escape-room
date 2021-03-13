import React from "react";
import moment from "moment";

import logo from "../images/logo-full.jpg";
import Attribution from "./Attribution";

const RankingsTable = ({ rankings, className = "", currentPlayer }) => (
  <table className={`rankings ${className}`}>
    {console.log("Rankings", rankings)}
    <tbody>
      {rankings.map(([rank, { netDuration, name, usedClues, id }], index) => (
        <tr
          className={
            currentPlayer && currentPlayer.team === id ? "highlight" : ""
          }
        >
          {console.log("team id " + id, currentPlayer)}
          {/* Rank */}
          <td>{index + 1}</td>
          <td>{name.replace(/^The/, "")}</td>
          <td>
            {moment.duration(netDuration, "seconds").get("minutes")}m{" "}
            {moment.duration(netDuration, "seconds").get("seconds")}s
          </td>
          <td>
            {usedClues} clue{usedClues > 1 || usedClues === 0 ? "s" : ""}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const EscapeRoomSignoff = ({
  rankings,
  game,
  currentPlayer,
  className = ""
}) => (
  <div
    className={`signoff ${className}`}
    onClick={e => e.target.classList.add("signoff__reveal")}
  >
    <header className="signoff__header">
      <img className="signoff__logo" src={logo} alt="JW Escape Rooms" />
    </header>
    <article className="signoff__text">
      <h2>Rankings</h2>
      <RankingsTable
        className="signoff__rankings"
        rankings={rankings}
        currentPlayer={currentPlayer}
      />
      {currentPlayer && game && (
        <>
          <h2>Would you like to host your own Escape Room?</h2>
          <p>
            Create an account at{" "}
            <a
              href={`https://${process.env.REACT_APP_BASE_URL}/register?referralcode=${game.host.referralCode}`}
              target="_blank"
            >
              jwzoom.games/register
            </a>{" "}
            and use {`${game.host.firstName.trim()}'s`} referral code{" "}
            <strong>{game.host.referralCode}</strong> to gain access.
          </p>
        </>
      )}
      <h2>Thanks for playing!</h2>
      <p>
        This game was created <em>by</em> and <em>for</em> our brothers and
        sisters. Have an idea for an escape room story? Email us at{" "}
        <a href="mailto:info@brotherapp.org">info@brotherapp.org</a>.
      </p>
      <p>You may now close this window.</p>
      <hr className="signoff__hr" />
      <div className="signoff__credits">
        <p>
          JW Zoom Games is not associated with the Watch Tower Bible and Tract
          Society of Pennsylvania in any way.
        </p>
        <p>All rights to credited images belong to their cited owners.</p>
        <Attribution className="signoff__attribution" />
      </div>
    </article>
  </div>
);

export default EscapeRoomSignoff;
