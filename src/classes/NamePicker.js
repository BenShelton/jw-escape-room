import _ from "lodash";

import teamNames from "../data/teamNames.json";

export default class NamePicker {
  constructor(options = {}) {
    this._names = [...teamNames];
    this._options = _.defaults(options, {
      prefix: "",
      suffix: ""
    });
  }

  getRemainingNames() {
    return this._names;
  }

  getRandom() {
    return _.trim(
      `${this._options.prefix} ${_.pullAt(this._names, this._randomIndex())} ${
        this._options.suffix
      }`
    );
  }

  _randomIndex() {
    return _.random(0, this._names.length - 1);
  }
}
