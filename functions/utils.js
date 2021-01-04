const { customAlphabet } = require("nanoid");

exports.generateReferralCode = () =>
  customAlphabet("1234567890abcdefghijklmnopqrstuv", 8)();
