const express = require("express");
const router = express.Router();

// Chat model
const Chat = require("../models/Chat");

// @route   POST api/chats/history
// @desc    Get the chat history by email
// @access  Public
router.post("/history", (req, res) => {
  Chat.find({ email: req.body.email })
    .then((chats) => {
      res.json({
        success: true,
        result: chats,
      });
    })
    .catch((err) => {
      res.json({
        success: false,
        result: [],
      });
    });
});

module.exports = router;
