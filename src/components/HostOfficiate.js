import React, { useContext } from "react";

import HostBase from "./HostBase";
import GameSetup from "./GameSetup";
import GameManager from "./GameManager";
import GameHostContext, { useGameHost } from "../contexts/GameHostContext";

const HostOfficiate = ({}) => {
  const { stage } = useGameHost();

  return (
    <GameHostContext>
      <HostBase>
        <GameSetup />
        {stage === "playing" && <GameManager />}
      </HostBase>
    </GameHostContext>
  );
};

export default HostOfficiate;