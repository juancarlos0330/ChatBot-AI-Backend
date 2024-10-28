const express = require("express");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const router = express.Router();

// User model
const User = require("../models/User");

// @route   POST api/users/sign
// @desc    Sign or Check user
// @access  Public
router.post("/signin", (req, res) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      // User Matched
      const payload = {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      }; // Create JWT Payload

      // Sign Token
      jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
        res.json({
          success: true,
          token: "Bearer " + token,
        });
      });
    } else {
      const newUser = new User({
        email: req.body.email,
      });

      newUser
        .save()
        .then((newuser) => {
          // User Matched
          const payload = {
            id: newuser.id,
            email: newuser.email,
            created_at: newuser.created_at,
          }; // Create JWT Payload

          // Sign Token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token,
              });
            }
          );
        })
        .catch((err) => console.log(err));
    }
  });
});

module.exports = router;
