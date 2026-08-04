const pool = require("../db");
const Product = require("./product.model");

/**
 * Create order + order items (transaction)
 * `items` from the client must only contain { product_id, quantity } —
 * price and stock are always re-fetched from the database, never trusted from the request.
 */
const createOrder = async (items, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const productIds = items.map((item) => item.product_id);
    const dbProducts = await Product.getProductsByIds(productIds);
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // validate every requested product exists and has enough stock,
    // and build the item list using the DB price — never the client's price
    let total_price = 0;
    const resolvedItems = items.map((item) => {
      const product = productMap.get(item.product_id);

      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for product ${item.product_id}`);
      }
      if (item.quantity > product.stock) {
        throw new Error(`Not enough stock for product ${item.product_id}`);
      }

      const price = Number(product.price);
      total_price += price * item.quantity;

      return { product_id: item.product_id, quantity: item.quantity, price };
    });

    // create order
    const orderQuery = `
      INSERT INTO orders (total_price)
      VALUES ($1)
      RETURNING *
    `;
    const orderResult = await client.query(orderQuery, [total_price]);
    const order = orderResult.rows[0];

    // insert order items + reduce stock, using the resolved (trusted) prices
    const itemQuery = `
      INSERT INTO order_items (order_id, user_id, product_id, quantity, price_at_time)
      VALUES ($1, $2, $3, $4,$5)
    `;

    for (const item of resolvedItems) {
      await client.query(itemQuery, [
        order.id,
        userId,
        item.product_id,
        item.quantity,
        item.price
      ]);

      await client.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");
    return order;

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Get all orders
 */
const getAllOrders = async () => {
  const query = `
    SELECT * FROM orders
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Get order by ID with items
 */
const getOrderById = async (id) => {
  const query = `
    SELECT 
      o.id,
      o.status,
      o.total_price,
      o.created_at,
      oi.id AS item_id,
      oi.user_id,
      oi.product_id,
      oi.quantity,
      oi.price
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows;
};

/**
 * Update order status
 */
const updateOrderStatus = async (id, status) => {
  const query = `
    UPDATE orders
    SET status = $1
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};

/**
 * Delete order
 */
const deleteOrder = async (id) => {
  const query = `
    DELETE FROM orders
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const checkoutFromCart = async (userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Get this user's cart items only
    const cartResult = await client.query(
      `
      SELECT 
        ci.product_id,
        ci.quantity,
        p.price,
        p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      `,
      [userId]
    );

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
          (order_id, user_id, product_id, quantity, price_at_time)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [order.id, userId, item.product_id, item.quantity, item.price]
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

    // 6️⃣ Clear only this user's cart
    await client.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);

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
