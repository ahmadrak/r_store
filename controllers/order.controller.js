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

    const order = await Order.createOrder(items);
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

const checkoutFromCart = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Get cart items
    const cartResult = await client.query(`
      SELECT 
        ci.product_id,
        ci.quantity,
        p.price,
        p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
    `);

    const cartItems = cartResult.rows;

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // 2️⃣ Validate stock + calculate total
    let totalPrice = 0;

    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        throw new Error(`Not enough stock for product ${item.product_id}`);
      }
      totalPrice += item.quantity * item.price;
    }

    // 3️⃣ Create order
    const orderResult = await client.query(
      `
      INSERT INTO orders (total_price, status)
      VALUES ($1, 'pending')
      RETURNING *
      `,
      [totalPrice]
    );

    const order = orderResult.rows[0];

    // 4️⃣ Create order items
    for (const item of cartItems) {
      await client.query(
        `
        INSERT INTO order_items
          (order_id, product_id, quantity, price_at_time)
        VALUES ($1, $2, $3, $4)
        `,
        [order.id, item.product_id, item.quantity, item.price]
      );

      // 5️⃣ Reduce stock
      await client.query(
        `
        UPDATE products
        SET stock = stock - $1
        WHERE id = $2
        `,
        [item.quantity, item.product_id]
      );
    }

    // 6️⃣ Clear cart
    await client.query(`DELETE FROM cart_items`);

    await client.query("COMMIT");

    return order;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  checkoutFromCart
};
