import _ from "lodash";

import teamNames from "../data/teamNames.json";

export default class NamePicker {
  constructor(options = {}) {
    this._primaryNames = [...teamNames.primary];
    this._secondaryNames = [...teamNames.secondary];
    this._options = _.defaults(options, {
      prefix: "",
      suffix: ""
    });
  }

  getRemainingNames() {
    return [...this._primaryNames, ...this._secondaryNames];
  }

  getRandom() {
    const arr = this._primaryNames.length
      ? this._primaryNames
      : this._secondaryNames;
    return _.trim(
      `${this._options.prefix} ${_.pullAt(arr, this._randomIndex(arr))} ${
        this._options.suffix
      }`
    );
  }

  _randomIndex(arr) {
    return _.random(0, arr.length - 1);
  }
}
