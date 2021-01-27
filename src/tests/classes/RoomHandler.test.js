import { expect } from "chai";

import RoomHandler from "../../classes/RoomHandler";

const seedRoom = {
  challengeMap: [42, 43],
  challenges: {
    42: {
      clue: "clue here",
      content: "<p>some html</p>",
      questions: [
        {
          answer: "answerone",
          question: "question here"
        }
      ]
    },
    43: {
      clue: "clue here again",
      content: "<p>some html again</p>",
      questions: [
        {
          answer: "answertwo",
          question: "question here again"
        },
        {
          answer: "answeranother",
          question: "question here again2"
        }
      ]
    }
  }
};

describe("Classes => RoomHandler", () => {
  describe("checkAnswers", () => {
    it("should pass all answers", () => {
      const Room = new RoomHandler(seedRoom);
      const result = Room.checkAnswers(42, ["answerone"]);
      expect(result)
        .to.be.an("array")
        .and.to.have.lengthOf(0);
    });
    it("should fail one answer", () => {
      const Room = new RoomHandler(seedRoom);
      const result = Room.checkAnswers(42, ["answerwrong"]);
      expect(result)
        .to.be.an("array")
        .and.to.have.lengthOf(1)
        .and.to.eql([0]);
    });
    it("should pass answers on more than one", () => {
      const Room = new RoomHandler(seedRoom);
      const result = Room.checkAnswers(43, ["answertwo", "answeranother"]);
      expect(result)
        .to.be.an("array")
        .and.to.have.lengthOf(0)
        .and.to.eql([]);
    });
    it("should fail one answer", () => {
      const Room = new RoomHandler(seedRoom);
      const result = Room.checkAnswers(43, ["answertwo", "answerwrong"]);
      expect(result)
        .to.be.an("array")
        .and.to.have.lengthOf(1)
        .and.to.eql([1]);
    });
    it("should fail two answers", () => {
      const Room = new RoomHandler(seedRoom);
      const result = Room.checkAnswers(43, ["answerwrong", "answerwrongagain"]);
      expect(result)
        .to.be.an("array")
        .and.to.have.lengthOf(2)
        .and.to.eql([0, 1]);
    });
  });
});
