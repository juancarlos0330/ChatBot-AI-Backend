const User = require("../models/User");

const notifyToAdmin = async (email) => {
  const result = User.updateOne({ email: email }, { $inc: { notifyCount: 1 } });
  if (result.nModified > 0) {
    return "success";
  } else {
    return "error";
  }
};

module.exports = notifyToAdmin; // Export the function using CommonJS
