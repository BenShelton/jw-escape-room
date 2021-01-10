import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import RegistrationPage from "./RegistrationPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import EscapeRoomLobby from "./EscapeRoomLobby";
import AuthContext from "../contexts/AuthContext";
import LoginPage from "./LoginPage";
import PrivateRoute from "./PrivateRoute";
import EscapeRoomContext from "../contexts/EscapeRoomContext";
import GameHostContext from "../contexts/GameHostContext";
import HostDashboard from "./HostDashboard";
import HostGames from "./HostGames";
import HostOfficiate from "./HostOfficiate";
import HostAccount from "./HostAccount";
import { getSubdomain } from "../helpers/utils";

export const EscapeRoomRoutes = () => (
  <Switch>
    <Route path="/" render={() => <p>You is lost brotha.</p>} exact />
    <Route path="/:gameId" exact>
      <EscapeRoomContext>
        <EscapeRoomLobby />
      </EscapeRoomContext>
    </Route>
  </Switch>
);

const StandardRoutes = () => (
  <AuthContext>
    <Switch>
      <Route path="/" component={LoginPage} exact />
      <Route path="/register" component={RegistrationPage} exact />
      <Route path="/forgot-password" component={ForgotPasswordPage} exact />
      <PrivateRoute path="/dashboard" component={HostDashboard} exact />
      <PrivateRoute path="/account" component={HostAccount} exact />
      <PrivateRoute path="/games" component={HostGames} exact />
      <PrivateRoute path="/games/:gameId" exact>
        <GameHostContext>
          <HostOfficiate />
        </GameHostContext>
      </PrivateRoute>
    </Switch>
  </AuthContext>
);

const AppRouter = () => {
  const subdomain = getSubdomain(
    window.location.href,
    process.env.NODE_ENV === "development"
  );
  return (
    <Router>
      {subdomain === "escaperoom" && <Route component={EscapeRoomRoutes} />}
      {subdomain === null && <Route component={StandardRoutes} />}
    </Router>
  );
};

export default AppRouter;
