const Order = require("../models/order.model");

/**
 * Create order
 */
const createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    

    const order = await Order.createOrder(items,req.user.id);
    res.status(201).json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all orders
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get single order with items
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await Order.getOrderById(id);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = {
      id: rows[0].id,
      status: rows[0].status,
      total_price: rows[0].total_price,
      created_at: rows[0].created_at,
      items: []
    };

    rows.forEach(row => {
      if (row.item_id) {
        order.items.push({
          id: row.item_id,
          product_id: row.product_id,
          quantity: row.quantity,
          price: row.price
        });
      }
    });

    res.json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update order status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.updateOrderStatus(id, status);

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete order
 */
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.deleteOrder(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order deleted successfully",
      order: deletedOrder
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const checkout = async (req, res) => {
  try {
    const order = await Order.checkoutFromCart();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  checkout
};
