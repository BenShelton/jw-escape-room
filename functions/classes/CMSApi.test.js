const CMSApi = require("./CMSApi");
const { expect } = require("chai");

it("finds correct room", async () => {
  let post = await CMSApi.findRoom("the-last-of-the-last-days");
  expect(post).to.have.property("title");
});

it("uses fields", async () => {
  let post = await CMSApi.getRoom("the-last-of-the-last-days", ["id"]);
  expect(post).not.to.have.property("slug");
  expect(post).to.have.property("id");
});

it("gets all rooms", async () => {
  let rooms = await CMSApi.getAllRooms();
  expect(rooms).to.be.an("array");
});

it("gets room info", async () => {
  let room = await CMSApi.findRoom("the-escape-to-noahs-ark");
  expect(room).to.have.property("status");
});

it("gets room challenges", async () => {
  let Room = await CMSApi.findRoom("the-escape-to-noahs-ark");
  await Room.getChallenges();
  // console.log(Room.challenges);
});

// it("gets all room challenges", async () => {
//   let rooms = await CMSApi.getAllRooms();
//
//   const getChallengePromises = rooms.map(Room => Room.getChallenges());
//
//   await Promise.all(getChallengePromises);
//
//   expect(rooms[0].challenges[0]).to.have.property("id");
//   expect(rooms[1].challenges[0]).to.have.property("id");
// });

it("sets room right", async () => {
  let rooms = await CMSApi.getAllRooms();
  const getChallengePromises = rooms.map(Room => Room.getChallenges());

  await Promise.all(getChallengePromises);

  rooms = rooms.map(Room => {
    const obj = {};
    obj.id = Room.id;
    obj.title = Room.title;
    obj.intro = {
      content: Room.intro,
      background: Room.coverImage("full") || null
    };
    obj.status = Room.status;
    obj.challenges = {};
    Room.challenges.forEach(challenge => {
      // enter challenges into challenge obj
      obj.challenges[challenge.id] = {
        questions: challenge.acf.questions,
        clue: challenge.acf.clue,
        content: challenge.content.rendered,
        title: challenge.title.rendered
      };
    });
    obj.challengeMap = Room.challengeMap;

    obj.outro = {
      content: Room.outro,
      background: Room.outroImage || null
    };
    return obj;
  });

  console.log(JSON.stringify(rooms));
});
