import React, { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children, component: Component, ...rest }) => {
  const { currentUser } = useAuth();

  return (
    <Route {...rest}>
      <>
        {currentUser ? (Component ? <Component {...rest} /> : children) : <Redirect to="/" />}
      </>
    </Route>
  );
};

export default PrivateRoute;
