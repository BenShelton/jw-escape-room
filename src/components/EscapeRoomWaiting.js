import { React } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

const EscapeRoomWaiting = ({ text, subtext, children }) => (
  <div className="game__screen__waiting">
    <div className="game__screen__waiting__inner">
      <p className="game__screen__waiting__heading">
        {text || "waiting for host"}
      </p>
      {subtext ? (
        <p
          className="game__screen__waiting__subtext"
          dangerouslySetInnerHTML={{ __html: subtext }}
        ></p>
      ) : (
        <p className="game__screen__waiting__subtext">
          Please keep this window open, do not use the back button or refresh
          the page.
        </p>
      )}
      {children}
      <CircularProgress style={{ color: "#fff" }} />
    </div>
  </div>
);

export default EscapeRoomWaiting;
