import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/database";
import "firebase/functions";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChT78KfjaveUW0yLIy8ZpnFvP6IN7CGNk",
  authDomain: "jw-escape-rooms.firebaseapp.com",
  projectId: "jw-escape-rooms",
  storageBucket: "jw-escape-rooms.appspot.com",
  messagingSenderId: "160402365445",
  appId: "1:160402365445:web:1382f47c16bc24e410d06c",
  measurementId: "G-8DKCGW0FB8"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

export const auth = firebaseApp.auth();
export const rdb = firebaseApp.database();
export const functions = firebaseApp.functions();
export default firebaseApp.firestore();
