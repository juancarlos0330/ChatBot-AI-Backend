const Chat = require("../models/Chat");

const messageSave = async (data) => {
  const newChat = new Chat({
    email: data.email,
    botFlag: data.botFlag,
    flag: data.flag,
    message: data.message,
  });

  const result = await newChat
    .save()
    .then((newchat) => {
      return "success";
    })
    .catch((err) => {
      return "error";
    });

  return result;
};

module.exports = messageSave; // Export the function using CommonJS
