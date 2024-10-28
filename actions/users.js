const User = require("../models/User");

const notifyToAdmin = async (email) => {
  const result = await User.updateOne(
    { email: email },
    { $inc: { notifyCount: 1 } }
  );
  if (result.modifiedCount > 0) {
    return "success";
  } else {
    return "error";
  }
};

module.exports = notifyToAdmin; // Export the function using CommonJS
