require("dotenv").config();
const express = require('express')
const app = express()
const pool = require("./db");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const ordersRoutes = require("./routes/order.routes");
const cartRoutes = require("./routes/cart.routes");
const authRoutes = require("./routes/auth.routes");
const session = require("express-session");
const passport = require("passport");
const cors = require('cors');
const checkoutRoutes = require("./routes/checkout.routes");
const userRoutes = require("./routes/user.routes");


const ensureAdmin = require('../middleware/auth');



app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// 👇 THIS LINE FIXES EVERYTHING
require("./config/passport")(passport);

app.use(passport.initialize());
app.use(passport.session());


app.get("/db-test",ensureAdmin ,async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use(express.json());


app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/checkout", checkoutRoutes);


app.listen(5000)
