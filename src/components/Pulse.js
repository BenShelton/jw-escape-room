import React from "react";

const Pulse = ({ type, speed, className }) => (
  <span className={`pulse pulse--type--${type} ${className}`}></span>
);

export default Pulse;
