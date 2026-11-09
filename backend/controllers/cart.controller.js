const Cart = require("../models/cart.model");
const validId = value => Number.isSafeInteger(Number(value)) && Number(value) > 0;
const validQuantity = value => Number.isSafeInteger(value) && value > 0;

const getCart = async (req, res) => {
  try {
    res.json(await Cart.getCartItems(req.user.id));
  } catch (_error) {
    res.status(500).json({ message: "Unable to load cart" });
  }
};
const addToCart = async (req, res) => {
  const { product_id, quantity } = req.body || {};
  if (!validId(product_id) || !validQuantity(quantity)) return res.status(400).json({ message: "Invalid product or quantity" });
  try {
    const item = await Cart.addToCart({ product_id: Number(product_id), quantity, userId: req.user.id });
    res.status(201).json(item);
  } catch (_error) {
    res.status(400).json({ message: "Unable to add item; check product and stock" });
  }
};
const updateCartItem = async (req, res) => {
  const { quantity } = req.body || {};
  if (!validId(req.params.id) || !validQuantity(quantity)) return res.status(400).json({ message: "Invalid cart item or quantity" });
  try {
    const item = await Cart.updateCartItem(req.params.id, quantity, req.user.id);
    if (!item) return res.status(404).json({ message: "Item not found or insufficient stock" });
    res.json(item);
  } catch (_error) {
    res.status(500).json({ message: "Unable to update cart" });
  }
};
const removeCartItem = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid cart item" });
  try {
    const item = await Cart.removeCartItem(req.params.id, req.user.id);
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    res.json({ message: "Item removed from cart", item });
  } catch (_error) {
    res.status(500).json({ message: "Unable to remove cart item" });
  }
};
module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
