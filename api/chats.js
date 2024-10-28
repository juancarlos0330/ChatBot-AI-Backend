const express = require("express");
const router = express.Router();

// @route   POST api/users/sign
// @desc    Sign or Check user
// @access  Public
router.post("/save", (req, res) => {
    console.log("save");
});

module.exports = router;