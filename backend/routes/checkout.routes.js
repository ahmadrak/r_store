const router = require("express").Router();
const { createCheckoutSession } = require("../controllers/checkout.controller");
const { ensureAuthenticated } = require("../middleware/auth");
router.post("/create-session", ensureAuthenticated, createCheckoutSession);
module.exports = router;
