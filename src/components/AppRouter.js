import React from "react";
import ReactGA from "react-ga";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import RegistrationPage from "./RegistrationPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import EscapeRoomLobby from "./EscapeRoomLobby";
import AuthProvider from "../contexts/AuthContext";
import LoginPage from "./LoginPage";
import PrivateRoute from "./PrivateRoute";
import EscapeRoomContext from "../contexts/EscapeRoomContext";
import GameHostContext from "../contexts/GameHostContext";
import HostGames from "./HostGames";
import HostOfficiate from "./HostOfficiate";
import HostAccount from "./HostAccount";
import { getSubdomain } from "../helpers/utils";
import AnalyticsTracker from "./AnalyticsTracker";
import { TRACKING_ID } from "../constants";

if (process.env.REACT_APP_FB_ENV === "production") {
  console.log("REPORTING ANALYTICS WITH ID " + TRACKING_ID);
  ReactGA.initialize(TRACKING_ID);
} else {
  console.log("NOT REPORTING ANALYTICS");
}

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
  <AuthProvider>
    <Switch>
      <Route path="/" component={LoginPage} exact />
      <Route path="/register" component={RegistrationPage} exact />
      <Route path="/forgot-password" component={ForgotPasswordPage} exact />
      <PrivateRoute path="/account" component={HostAccount} exact />
      <PrivateRoute path="/games" component={HostGames} exact />
      <PrivateRoute path="/games/:gameId" exact>
        <GameHostContext>
          <HostOfficiate />
        </GameHostContext>
      </PrivateRoute>
    </Switch>
  </AuthProvider>
);

const AppRouter = () => {
  const subdomain = getSubdomain(window.location.href);
  return (
    <Router>
      {console.log("SUBDOMAIN", subdomain)}
      {console.log("BASE_URL", process.env.REACT_APP_BASE_URL)}
      {console.log("FB_ENV", process.env.REACT_APP_FB_ENV)}
      {subdomain === "escaperoom" && <Route component={EscapeRoomRoutes} />}
      {subdomain === null && <Route component={StandardRoutes} />}
      {/* FIXME: add 404 page */}
      <AnalyticsTracker />
    </Router>
  );
};

export default AppRouter;
