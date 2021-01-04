const test = require("firebase-functions-test")(
  {
    apiKey: "AIzaSyChT78KfjaveUW0yLIy8ZpnFvP6IN7CGNk",
    authDomain: "jw-escape-rooms.firebaseapp.com",
    databaseURL: "https://jw-escape-rooms-default-rtdb.firebaseio.com",
    projectId: "jw-escape-rooms",
    storageBucket: "jw-escape-rooms.appspot.com",
    messagingSenderId: "160402365445",
    appId: "1:160402365445:web:1382f47c16bc24e410d06c",
    measurementId: "G-8DKCGW0FB8"
  },
  "/Users/julian1729/Documents/Web Projects/biblee-escape-room/jw-escape-rooms-63466ceba542.json"
);
const functions = require("../index.js");
const admin = require("firebase-admin");
const { https } = require("firebase-functions");
const chai = require("chai");
const asserttype = require("chai-asserttype");
chai.use(asserttype);
const { expect } = chai;

describe("registerHost", () => {
  const seededUser = {
    firstName: "Julian",
    lastName: "Hernandez",
    email: "hernandez.julian17@gmail.com",
    referralCode: "gamemaster1"
  };

  it("should register host in database", async () => {
    await admin
      .firestore()
      .collection("users")
      .add(seededUser);
    const wrapped = test.wrap(functions.registerHost);
    const res = await wrapped({
      firstName: "Jeremy",
      lastName: "Palmer",
      email: "jpalmer@yahoo.com",
      password: "adsfasdf123",
      referralCode: seededUser.referralCode
    });
    expect(res).to.be.string();
  });

  it("should throw invalid referralCode ", async () => {
    const wrapped = test.wrap(functions.registerHost);
    try {
      await wrapped({
        firstName: "Jeremy",
        lastName: "Palmer",
        email: "jpalmer@yahoo.com",
        password: "adsfasdf123",
        referralCode: "rando"
      });
      throw new Error("Expected to throw invalid ref code");
    } catch (e) {
      expect(e instanceof https.HttpsError).to.be.true;
    }
  });

  it("should throw user email error", async () => {
    const wrapped = test.wrap(functions.registerHost);
    await wrapped(seededUser);
    try {
      await wrapped({
        firstName: "Jeremy",
        lastName: "Palmer",
        email: seededUser.email,
        password: "adsfasdf123",
        referralCode: seededUser.referralCode
      });
      throw new Error("Expected to throw email already exists error");
    } catch (e) {
      expect(e.code).to.equal("auth/email-already-exists");
    }
  });
});

test.cleanup();
