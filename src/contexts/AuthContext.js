import React, { useContext, useState, useEffect } from "react";
import ReactGA from "react-ga";

import db, { auth, functions } from "../firebase";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);
  const [hostRecord, setHostRecord] = useState();

  const login = async (email, password) => {
    ReactGA.event({
      category: "User",
      action: "Logged in"
    });
    await auth.signInWithEmailAndPassword(email, password);
  };

  /**
   * @param  {Object}  user User object w/
   * firstName, lastName, email, password, referralCode
   * @return {Promise} Login
   */
  const signup = async user => {
    const { email, password } = user;
    const registerHost = functions.httpsCallable("registerHost");
    const hostRecord = await registerHost(user);
    setHostRecord(hostRecord);
    ReactGA.event({
      category: "User",
      action: "Created an Account"
    });
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
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (!hostRecord && user) {
        console.log(`Getting user record for ${user.uid}`);
        const record = await db
          .collection("users")
          .doc(user.uid)
          .get();
        setCurrentUser({ uid: user.uid, ...record.data() });
      } else {
        setCurrentUser(hostRecord);
      }
      setLoading(false);
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
