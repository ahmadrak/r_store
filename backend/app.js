require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const pool = require("./db");
const { ensureAdmin } = require("./middleware/auth");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",").map(origin => origin.trim()).filter(Boolean);

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be configured");
}
if (isProduction && !process.env.CLIENT_URL) {
  throw new Error("CLIENT_URL must be configured in production");
}
if (isProduction) app.set("trust proxy", 1);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  },
}));
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/db-test", ensureAdmin, async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ success: true });
  } catch (_error) {
    res.status(503).json({ error: "Database unavailable" });
  }
});

app.use("/api/products", require("./routes/product.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/checkout", require("./routes/checkout.routes"));

const port = Number(process.env.PORT) || 5000;
if (require.main === module) app.listen(port, () => console.log(`API listening on port ${port}`));
module.exports = app;
