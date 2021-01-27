import _ from "lodash";

export default class RoomHandler {
  constructor(roomData) {
    this._roomData = roomData;
    this._title = roomData.title;
    this._intro = roomData.intro;
    this._outro = roomData.outro;
    this._challengeMap = roomData.challengeMap;
    this._duration = roomData.duration;
    this._challenges = roomData.challenges;
  }

  /**
   * Check passed in answer against room data
   * @param  {Number} challenge        Challenge id
   * @param  {Array}  [submissions=[]] Submissions ordered by index
   * @return {Array}                   Array of wrong answers
   */
  checkAnswers(id, submissions = []) {
    const answers = _.map(this._roomData.challenges[id].questions, "answer");
    const wrong = [];
    answers.forEach((answer, i) =>
      submissions[i] !== answer ? wrong.push(i) : null
    );
    return wrong;
  }

  getChallengeQuestions(id) {
    return _.map(this._challenges[id].questions, "questions");
  }

  getChallengeContent(id) {
    return this._challenges[id].content;
  }
}
