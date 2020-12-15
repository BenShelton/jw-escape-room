import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import GameNotFound from "./GameNotFound";
import SignUpPage from "./SignUpPage";
import Game from "./Game";
import HostDashboard from "./HostDashboard";
import AuthContext from "../contexts/AuthContext";
import LoginPage from "./LoginPage";
import PrivateRoute from "./PrivateRoute";
// import AnonCreate from "./AnonCreate";
import GameContext from "../contexts/GameContext";
// import GameContext from "../contexts/GameContext";

const AppRouter = () => (
  <Router>
    <AuthContext>
      <Switch>
        <Route path="/" component={LoginPage} exact />
        <Route path="/register" component={SignUpPage} exact />
        <PrivateRoute path="/dashboard" component={HostDashboard} exact />
        <Route path="/play/:gameId" exact>
          <GameContext>
            <Game />
          </GameContext>
        </Route>
        <Route render={GameNotFound} />
      </Switch>
    </AuthContext>
  </Router>
);

export default AppRouter;
