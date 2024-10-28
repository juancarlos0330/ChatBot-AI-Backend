const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ChatSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  botFlag: {  // check if bot or human
    type: Boolean,
    required: true,
  },
  flag: {  // check if sender or receiver
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Chat = mongoose.model("chats", ChatSchema);
