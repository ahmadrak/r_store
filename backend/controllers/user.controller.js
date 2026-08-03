const User = require("../models/user.model");

// GET /api/users  (admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:id  (admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // never leak the password hash
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/users/me  (any authenticated user, updates own profile)
const updateMe = async (req, res) => {
  const { name, email } = req.body;

  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({ message: "Invalid name" });
  }
  if (email !== undefined && typeof email !== "string") {
    return res.status(400).json({ message: "Invalid email" });
  }

  try {
    const updatedUser = await User.updateUser(req.user.id, { name, email });

    if (!updatedUser) {
      return res.status(400).json({ message: "No valid fields provided" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/me/password  (any authenticated user)
const updateMyPassword = async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const updatedUser = await User.updatePassword(req.user.id, newPassword);
    res.json({ message: "Password updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/:id/role  (admin only)
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
  }

  try {
    const updatedUser = await User.updateUser(id, { role });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id  (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // prevent an admin from deleting their own account by mistake via this route
    if (String(req.user.id) === String(id)) {
      return res.status(400).json({ message: "Use account deletion flow to remove your own account" });
    }

    const deletedUser = await User.deleteUser(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateMe,
  updateMyPassword,
  updateUserRole,
  deleteUser,
};