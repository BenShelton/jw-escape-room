const _ = require("lodash");
const chai = require("chai");
const { expect } = chai;

const TeamScorer = require("../../classes/TeamScorer");

const teamsObj = {
  // 1440 - 3
  randomId1: {
    currentChallenge: "outro",
    endTime: 1614867738, // 20 min 1200 seconds
    usedClues: [2, 3] // 120 seconds
  },
  // 1560 - 4
  randomId2: {
    currentChallenge: "outro",
    endTime: 1614868098 // 26 min
  },
  // 1380 - 1
  randomId3: {
    currentChallenge: "outro",
    endTime: 1614867918 // 23 min
  },
  // 1980 - 5
  randomId4: {
    currentChallenge: "outro",
    endTime: 1614868158, // 27 min
    usedClues: [2, 3, 6]
  },
  // 1380 - 2
  randomId5: {
    currentChallenge: "outro",
    endTime: 1614867678, // 19 min
    usedClues: [2, 3]
  },
  // 7
  randomId6: {
    currentChallenge: 45,
    usedClues: [5]
  },
  // 8
  randomId7: {
    currentChallenge: 67
  },
  // 6
  randomId8: {
    currentChallenge: 45
  }
};

const startTime = 1614866538;

const challengeMap = [1, 2, 4, 45, 6, 67, 85];

describe("TeamScorer", () => {
  describe("_calculateNetDuration", () => {
    it("should calculate 24 minutes net time", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const duration = Scorer._calculateNetDuration(teamsObj.randomId1);

      expect(duration).to.equal(1440);
    });
    it("should return null for no endtime", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const duration = Scorer._calculateNetDuration(teamsObj.randomId6);

      expect(duration).to.equal(null);
    });
  });
  describe("_createTeamScoreObj", () => {
    it("should create correct obj", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const obj = Scorer._createTeamScoreObj(["randomId1", teamsObj.randomId1]);

      expect(obj[1]).to.include({
        endTime: 1614867738,
        usedClues: 2,
        netDuration: 1440
      });
    });
  });
  describe("_isBetter", () => {
    it("should return true that with better endtime", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const team1 = _.clone(teamsObj.randomId1);
      team1.netDuration = Scorer._calculateNetDuration(team1);

      const team2 = _.clone(teamsObj.randomId2);
      team2.netDuration = Scorer._calculateNetDuration(team2);

      const result = Scorer._isBetter(team1, team2);

      expect(result).to.be.true;
    });

    it("should return false that with worse endtime", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const team1 = _.clone(teamsObj.randomId1);
      team1.netDuration = Scorer._calculateNetDuration(team1);

      const team2 = _.clone(teamsObj.randomId2);
      team2.netDuration = Scorer._calculateNetDuration(team2);

      const result = Scorer._isBetter(team2, team1);

      expect(result).to.be.false;
    });

    it("should return false for incompletion against complete", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const team1 = _.clone(teamsObj.randomId6);
      team1.netDuration = Scorer._calculateNetDuration(team1);

      const team2 = _.clone(teamsObj.randomId5);
      team2.netDuration = Scorer._calculateNetDuration(team2);

      const result = Scorer._isBetter(team1, team2);

      expect(result).to.be.false;
    });

    it("should return true for completion against incompletion", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const team1 = _.clone(teamsObj.randomId5);
      team1.netDuration = Scorer._calculateNetDuration(team1);

      const team2 = _.clone(teamsObj.randomId6);
      team2.netDuration = Scorer._calculateNetDuration(team2);

      const result = Scorer._isBetter(team1, team2);

      expect(result).to.be.true;
    });

    it("should return true for better challenge progression although both incomplete", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const team1 = Scorer._createTeamScoreObj([
        "team1",
        _.clone(teamsObj.randomId6)
      ]);
      const team2 = Scorer._createTeamScoreObj([
        "team2",
        _.clone(teamsObj.randomId7)
      ]);

      const result = Scorer._isBetter(team1[1], team2[1]);

      expect(result).to.be.equal(true);
    });

    it("should return false for worse challenge progression although both incomplete", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const team1 = Scorer._createTeamScoreObj([
        "team1",
        _.clone(teamsObj.randomId7)
      ]);
      const team2 = Scorer._createTeamScoreObj([
        "team2",
        _.clone(teamsObj.randomId6)
      ]);

      const result = Scorer._isBetter(team1[1], team2[1]);

      expect(result).to.be.false;
    });

    it("should return true for better clue usage although both incomplete and tied on challenge progression", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const team1 = Scorer._createTeamScoreObj([
        "team1",
        _.clone(teamsObj.randomId8)
      ]);
      const team2 = Scorer._createTeamScoreObj([
        "team2",
        _.clone(teamsObj.randomId6)
      ]);

      const result = Scorer._isBetter(team1[1], team2[1]);

      expect(result).to.be.true;
    });

    it("should return false for worse clue usage although both incomplete and tied on challenge progression", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const team1 = Scorer._createTeamScoreObj([
        "team1",
        _.clone(teamsObj.randomId6)
      ]);
      const team2 = Scorer._createTeamScoreObj([
        "team2",
        _.clone(teamsObj.randomId8)
      ]);

      const result = Scorer._isBetter(team1[1], team2[1]);

      expect(result).to.be.false;
    });

    it("should return true that with tied results", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const team1 = _.clone(teamsObj.randomId1);
      team1.netDuration = Scorer._calculateNetDuration(team1);

      const team2 = _.clone(teamsObj.randomId1);
      team2.netDuration = Scorer._calculateNetDuration(team2);

      const result = Scorer._isBetter(team2, team1);

      expect(result).to.be.true;
    });
  });
  describe("getRankings", () => {
    it("should get rankings", () => {
      const Scorer = new TeamScorer({
        teams: teamsObj,
        startTime,
        challengeMap
      });

      const rankings = Scorer.getRankings();

      // get only names
      const teamNamesInOrder = rankings.map(([name]) => name);

      expect(teamNamesInOrder).to.eql([
        "randomId3",
        "randomId5",
        "randomId1",
        "randomId2",
        "randomId4",
        "randomId8",
        "randomId6",
        "randomId7"
      ]);
    });
  });
  describe("getRankingsObject", () => {
    it("should get rankings obejct", () => {
      const Scorer = new TeamScorer({
        teams: {
          randomId1: {
            currentChallenge: "outro",
            endTime: 1614867738, // 20 min 1200 seconds
            usedClues: [2, 3] // 120 seconds
          }
        },
        startTime,
        challengeMap
      });

      const rankings = Scorer.getRankings();

      // get only names

      console.log(Scorer.getRankingsObject());
    });
  });
});
