import React from "react";

import zoomLogo from "../images/zoom-logo.svg";

const ZoomCredentials = ({ meeting, className = "" }) => (
  <div className={`zoom-credentials ${className}`}>
    <img
      className="zoom-credentials__logo"
      src={zoomLogo}
      alt="Zoom Meeting Credentials"
    />
    <p className="zoom-credentials__meeting-info">
      <strong>Meeting ID: </strong>
      {meeting.id}
    </p>
    <p className="zoom-credentials__meeting-info">
      <strong>Password: </strong>
      {meeting.password}
    </p>
  </div>
);

export default ZoomCredentials;
