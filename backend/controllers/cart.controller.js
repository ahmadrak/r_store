const Cart = require("../models/cart.model");

/**
 * Get cart items
 * GET /api/cart
 */
const getCart = async (req, res) => {
  try {
    const items = await Cart.getCartItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Add item to cart
 * POST /api/cart
 */
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    const item = await Cart.addToCart({ product_id, quantity });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Update cart item quantity
 * PATCH /api/cart/:id
 */
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const updated = await Cart.updateCartItem(id, quantity);

    if (!updated) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Remove cart item
 * DELETE /api/cart/:id
 */
const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    const removed = await Cart.removeCartItem(id);

    if (!removed) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({
      message: "Item removed from cart",
      item: removed,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
