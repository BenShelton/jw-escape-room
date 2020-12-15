import React, { useState, useEffect } from "react";

import { auth, rdb } from "../firebase";

const AnonCreate = () => {
  const [user, setUser] = useState(null);

  auth.onAuthStateChanged(user => {
    setUser(user);
  });

  useEffect(() => {
    let tempUser = null;
    auth
      .signInAnonymously()
      .then(result => {
        tempUser = result.user;
        setUser(result.user);
        return result.user.updateProfile({ displayName: "Dom" });
      })
      .then(() => {
        // create doc in rdb
        rdb.ref("users/" + tempUser.uid).set({
          name: tempUser.displayName
        });
      })
      .catch(error => {
        console.log(error.code);
        console.log(error.message);
      });
  }, []);

  return <p>{user && JSON.stringify(user)}</p>;
};

export default AnonCreate;
