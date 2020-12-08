import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import GameNotFound from "./GameNotFound";
import GameWelcomePage from "./GameWelcomePage";

const AppRouter = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/" component={GameNotFound} exact />
      <Route path="/:gameId" component={GameWelcomePage} exact />
      <Route render={() => <p>404 :\</p>} />
    </Switch>
  </BrowserRouter>
);

export default AppRouter;
