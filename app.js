require("dotenv").config();
const express = require('express')
const app = express()
const pool = require("./db");
const productRoutes = require("./routes/product.routes");

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use(express.json());


app.use("/api/products", productRoutes);

app.listen(5000)