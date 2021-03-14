import { React, useState, useEffect } from "react";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

const EscapeRoomEnter = ({ currentPlayer, enterPlayer }) => {
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

export default EscapeRoomEnter;
