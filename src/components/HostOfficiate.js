import React, { useContext } from "react";

import HostBase from "./HostBase";
import GameSetup from "./GameSetup";
import HostEscapeRoomObserver from "./HostEscapeRoomObserver";
import GameHostContext, { useGameHost } from "../contexts/GameHostContext";

const HostOfficiate = ({}) => {
  const { stage } = useGameHost();

  return (
    <GameHostContext>
      <HostBase>
        <GameSetup />
        {stage === "playing" && <HostEscapeRoomObserver />}
      </HostBase>
    </GameHostContext>
  );
};

export default HostOfficiate;
