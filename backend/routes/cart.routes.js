const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} = require("../controllers/cart.controller");

/**
 * Cart routes
 */
router.get("/", getCart);
router.post("/", addToCart);
router.patch("/:id", updateCartItem);
router.delete("/:id", removeCartItem);

module.exports = router;
