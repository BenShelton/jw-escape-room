import React, { useContext, useState, useEffect } from "react";

import db, { auth } from "../firebase";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  const signup = (email, password) => {
    return auth.createUserWithEmailAndPassword(email, password);
  };

  const login = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const logout = () => {
    return auth.signOut();
  };

  const resetPassword = email => auth.sendPasswordResetEmail(email);

  const cosignRegistration = async (referralCode, email) => {
    const findCosigners = await db
      .collection("users")
      .where("referralCode", "==", referralCode)
      .limit(1)
      .get();
    if (findCosigners.empty) throw new Error("Invalid referral code.");
    const cosigner = findCosigners.docs[0];
    const initialValue = cosigner.data().cosigned || [];
    return await db
      .collection("users")
      .doc(cosigner.id)
      .update({ cosigned: [...initialValue, email] });
  };

  window.jwLogout = logout;
  window.whoami = () => console.log(currentUser);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    cosignRegistration
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
