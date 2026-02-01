const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.model");
const { ensureAuthenticated } = require("../middleware/auth");

// Signup
router.post("/signup", async (req, res) => {
  try {
    const user = await User.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Logged in successfully", user: req.user });
});

// Logout
router.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});

// Get current user
router.get("/me", ensureAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
