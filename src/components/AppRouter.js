import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import GameNotFound from "./GameNotFound";
import SignUpPage from "./SignUpPage";
import Game from "./Game";
import AuthContext from "../contexts/AuthContext";
import LoginPage from "./LoginPage";
import PrivateRoute from "./PrivateRoute";
import GameContext from "../contexts/GameContext";
import GameHostContext from "../contexts/GameHostContext";
import HostDashboard from "./HostDashboard";
import HostGames from "./HostGames";
import HostOfficiate from "./HostOfficiate";
import { getSubdomain } from "../helpers/utils";

// const AppRouter = () => (
//   <Router>
//     <AuthContext>
//       <Switch>
//         <Route path="/" component={LoginPage} exact />
//         <Route path="/register" component={SignUpPage} exact />
//         <PrivateRoute path="/dashboard" component={HostDashboard} exact />
//         <PrivateRoute path="/games" component={HostGames} exact />
//         <PrivateRoute path="/games/:gameId" exact>
//           <GameHostContext>
//             <HostOfficiate />
//           </GameHostContext>
//         </PrivateRoute>
//         <Route path="/play/:gameId" exact>
//           <GameContext>
//             <Game />
//           </GameContext>
//         </Route>
//         <Route render={GameNotFound} />
//       </Switch>
//     </AuthContext>
//   </Router>
// );

export const PlayerRoutes = () => (
  <Switch>
    <Route path="/" render={() => <p>You is lost brotha.</p>} exact />
    <Route path="/:gameId" exact>
      <GameContext>
        <Game />
      </GameContext>
    </Route>
  </Switch>
);

const StandardRoutes = () => (
  <AuthContext>
    <Switch>
      <Route path="/" component={LoginPage} exact />
      <Route path="/register" component={SignUpPage} exact />
      <PrivateRoute path="/dashboard" component={HostDashboard} exact />
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
      {subdomain === "escaperoom" && <Route component={PlayerRoutes} />}
      {subdomain === null && <Route component={StandardRoutes} />}
    </Router>
  );
};

export default AppRouter;
