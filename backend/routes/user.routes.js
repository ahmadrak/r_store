const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateMe,
  updateMyPassword,
  updateUserRole,
  deleteUser,
} = require("../controllers/user.controller");
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");

// self-service routes — must come before "/:id" so "me" isn't parsed as an id
router.patch("/me", ensureAuthenticated, updateMe);
router.patch("/me/password", ensureAuthenticated, updateMyPassword);

// admin-only routes
router.get("/", ensureAuthenticated, ensureAdmin, getUsers);
router.get("/:id", ensureAuthenticated, ensureAdmin, getUserById);
router.patch("/:id/role", ensureAuthenticated, ensureAdmin, updateUserRole);
router.delete("/:id", ensureAuthenticated, ensureAdmin, deleteUser);

module.exports = router;