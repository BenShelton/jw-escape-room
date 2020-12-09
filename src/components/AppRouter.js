import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import GameNotFound from "./GameNotFound";
import FrontPage from "./FrontPage";
import SignUpPage from "./SignUpPage";
import GameWelcomePage from "./GameWelcomePage";
import AuthContext from '../contexts/AuthContext';

const AppRouter = () => (
  <AuthContext>
    <BrowserRouter>
      <Switch>
        <Route path="/" component={SignUpPage} exact />
        <Route path="/:gameId" component={GameWelcomePage} exact />
        <Route render={GameNotFound} />
      </Switch>
    </BrowserRouter>
  </AuthContext>
);

export default AppRouter;
