import React from "react";
import { Link, useHistory } from "react-router-dom";

import HostBase from "./HostBase";
import { useAuth } from "../contexts/AuthContext";
import GameSetup from "./GameSetup";

const HostDashboard = ({}) => {
  const { currentUser, logout } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await logout();
      history.push("/");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <HostBase>
        <button onClick={handleLogout}>Logout</button>
      </HostBase>
    </>
  );
};

export default HostDashboard;
