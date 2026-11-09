const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user.model");
const { ensureAuthenticated } = require("../middleware/auth");
const safeUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "Valid name, email and password (minimum 8 characters) required" });
  }
  try {
    const user = await User.createUser({ name: name.trim(), email: email.trim().toLowerCase(), password });
    res.status(201).json(safeUser(user));
  } catch (_error) {
    res.status(400).json({ message: "Unable to create account" });
  }
});
router.post("/login", passport.authenticate("local"), (req, res) => {
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ message: "Login failed" });
    req.login(req.user, (loginError) => {
      if (loginError) return res.status(500).json({ message: "Login failed" });
      res.json({ message: "Logged in successfully", user: safeUser(req.user) });
    });
  });
});
router.post("/logout", ensureAuthenticated, (req, res) => {
  req.logout((error) => {
    if (error) return res.status(500).json({ message: "Logout failed" });
    req.session.destroy((sessionError) => {
      if (sessionError) return res.status(500).json({ message: "Logout failed" });
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
});
router.get("/me", ensureAuthenticated, (req, res) => res.json({ user: safeUser(req.user) }));
module.exports = router;
