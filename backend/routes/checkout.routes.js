const router = require("express").Router();
const { createCheckoutSession } = require("../controllers/checkout.controller");
const { ensureAuth } = require("../middlewares/auth");

router.post("/create-session", ensureAuth, createCheckoutSession);

module.exports = router;
