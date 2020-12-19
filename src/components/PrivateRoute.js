import React from "react";
import { Route, Redirect } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children, ...rest }) => {
  const { currentUser } = useAuth();
  return (
    <Route
      {...rest}
      render={
        props => (currentUser ? children : <Redirect to="/" />)
        // <Component {...props} />
      }
    ></Route>
  );
};

export default PrivateRoute;
