// Ensure user is logged in
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
};

// Ensure user is admin
const ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403).json({ message: "Forbidden: Admins only" });
};

module.exports = { ensureAuthenticated, ensureAdmin };
