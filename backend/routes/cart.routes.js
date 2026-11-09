const router = require("express").Router();
const { ensureAuthenticated } = require("../middleware/auth");
const { getCart, addToCart, updateCartItem, removeCartItem } = require("../controllers/cart.controller");
router.use(ensureAuthenticated);
router.get("/", getCart);
router.post("/", addToCart);
router.patch("/:id", updateCartItem);
router.delete("/:id", removeCartItem);
module.exports = router;
