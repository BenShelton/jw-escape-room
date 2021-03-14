import React from "react";
import Typography from "@material-ui/core/Typography";

import HostBase from "./HostBase";
import GameSetup from "./GameSetup";
import HostEscapeRoomObserver from "./HostEscapeRoomObserver";
import GameHostContext, { useGameHost } from "../contexts/GameHostContext";

const HostOfficiate = () => {
  const { stage } = useGameHost();

  return (
    <GameHostContext>
      <HostBase>
        <GameSetup />
        {stage === "playing" && <HostEscapeRoomObserver />}
        {stage === "final" && (
          <Typography variant="h5" gutterBottom>
            Final
          </Typography>
        )}
      </HostBase>
    </GameHostContext>
  );
};

export default HostOfficiate;
