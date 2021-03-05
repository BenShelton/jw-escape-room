const _ = require("lodash");
const moment = require("moment");

class TeamScorer {
  constructor({ teams: teamsObj, startTime, challengeMap, clueValue }) {
    this._teamsObj = teamsObj;
    this._teams = Object.entries(teamsObj);
    this._startTime = startTime;
    this._challengeMap = challengeMap;
    this._cluesValue = clueValue || 120; // subtract 60 seconds for each clues
    // this._duration = duration;
    this._rankings = [];
  }

  /**
   * Sort teams by endTime and if not endTime then progression
   * @param  {Object} teamsObj  Teams object from firebase
   * @param  {Number} startTime The start time of the room for reference
   * @return {Array}            Array of sorted team Ids and names
   */
  getRankings() {
    // clear rankings every time
    this._rankings = [];
    // blindly enter first team into rankigs with duration
    this._rankings.push(this._createTeamScoreObj(this._teams[0]));
    // console.log("INCEPTOR ", this._createTeamScoreObj(this._teams[0]));
    // if there is only 1 team there is nothing to be compared
    if (this._teams.length === 1) return;
    // start from second team
    for (let i = 1; i < this._teams.length; i++) {
      // generate score object
      const currentTeam = this._createTeamScoreObj(this._teams[i]);
      // console.log("KILLER " + currentTeam[0]);
      let spot = null;
      // search for correct position in rankings
      for (let j = 0; j < this._rankings.length; j++) {
        const challenger = this._rankings[j];
        // console.log("CHALLENGER " + j + ` ${challenger[0]}`);
        if (this._isBetter(currentTeam[1], challenger[1])) {
          // console.log(`${currentTeam[0]} killed ${challenger[0]}`);
          spot = j;
          break;
        }
      }
      // console.log("spot", spot);
      if (spot !== null) {
        // console.log(`${currentTeam[0]} inserted at spot`);
        this._rankings.splice(spot, 0, currentTeam);
      } else {
        this._rankings.push(currentTeam);
        // console.log(`${currentTeam[0]} pushed to back`);
      }
    }
    // eslint-disable-next-line
    return this._rankings;
  }

  /**
   * [_createTeamScoreObj description]
   * @param  {Array} team From Object.entries [teamId, teamData]
   * @return {Array}      Modified data with net duration
   */
  _createTeamScoreObj(team) {
    const teamData = _.pick(team[1], [
      "endTime",
      "name",
      "usedClues",
      "currentChallenge"
    ]);
    teamData.netDuration = this._calculateNetDuration(teamData);
    teamData.usedClues = teamData.usedClues ? teamData.usedClues.length : 0;
    return [team[0], teamData];
  }

  /**
   * Calculate total duration it took for team to finish in seconds
   * @param  {Object} team Team object
   * @return {Number} Total duration
   */
  _calculateNetDuration(team) {
    if (!team.endTime) return null;
    const difference = moment
      .unix(team.endTime)
      .diff(moment.unix(this._startTime));
    const duration = moment.duration(difference).as("seconds");
    // prettier-ignore
    return duration + ( team.usedClues ? team.usedClues.length * this._cluesValue : 0 );
  }

  /**
   * Compare two teams, is team1 lower scored than team2
   * @param  {Object}  team1 Team A
   * @param  {Object}  team2 Team B
   * @return {Boolean}       True or False
   */
  _isBetter(team1, team2) {
    // handle case where there is not endtime for
    // one of or both teams
    if (team1.endTime && !team2.endTime) {
      // console.log("Better with completion");
      return true;
    } else if (!team1.endTime && team2.endTime) {
      // console.log("-- Worse with incompletion");
      return false;
    } else if (
      (!team1.endTime && !team2.endTime) ||
      team1.endTime === team2.endTime
    ) {
      // neither team completed game, so compare challenge progression
      const team1Index = this._challengeMap.indexOf(team1.currentChallenge);
      const team2Index = this._challengeMap.indexOf(team2.currentChallenge);
      if (team1Index !== team2Index) {
        // only make decision here if they are not equal
        // console.log("-- Deciding by better challenge progression...");
        return team1Index < team2Index;
      }
      // teams were tied on challenge, compare clues
      if (team1.usedClues !== team2.usedClues) {
        // console.log("-- Tied on challenge progression, deciding on clues...");
        return team1.usedClues < team2.usedClues;
      }
      // clues were also tied
      // QUESTION: should this return true or false in the case of a definite tie??
      // console.log("-- Teams dead tied");
      return true;
    }
    // console.log("Deciding on best endtime");
    // both teams have different endtimes
    return team1.netDuration < team2.netDuration;
  }
}

module.exports = TeamScorer;
