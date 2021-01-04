import React, { useContext, useState, useEffect } from "react";

import { auth, functions } from "../firebase";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  const login = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  /**
   * [signup description]
   * @param  {Object}  user User object w/
   * firstName, lastName, email, password, referralCode
   * @return {Promise} Login
   */
  const signup = async user => {
    const { email, password } = user;
    const registerHost = functions.httpsCallable("registerHost");
    await registerHost(user);
    return auth.signInWithEmailAndPassword(email, password);
  };

  const logout = () => {
    return auth.signOut();
  };

  const resetPassword = email => auth.sendPasswordResetEmail(email);

  window.jwLogout = logout;
  window.whoami = () => console.log(currentUser);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
      console.log("innow", user);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
