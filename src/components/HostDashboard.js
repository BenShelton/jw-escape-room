import React from "react";
import { Link, useHistory } from "react-router-dom";

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
      <GameSetup />
      <button onClick={handleLogout}>Logout</button>
    </>
  );
};

export default HostDashboard;
