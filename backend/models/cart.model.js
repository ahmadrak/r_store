const pool = require("../db");

const getCartItems = async (userId) => {
  const result = await pool.query(`
    SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = $1
    ORDER BY ci.created_at DESC
  `, [userId]);
  return result.rows;
};

const addToCart = async ({ product_id, quantity, userId }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const product = await client.query("SELECT id, stock FROM products WHERE id = $1 FOR UPDATE", [product_id]);
    if (!product.rows.length) throw new Error("Product not found");
    const existing = await client.query(
      "SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 FOR UPDATE",
      [userId, product_id]
    );
    const total = quantity + (existing.rows[0]?.quantity || 0);
    if (total > product.rows[0].stock) throw new Error("Not enough stock");
    const result = existing.rows.length
      ? await client.query("UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *", [total, existing.rows[0].id, userId])
      : await client.query("INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *", [userId, product_id, quantity]);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const updateCartItem = async (id, quantity, userId) => {
  const result = await pool.query(`
    UPDATE cart_items ci SET quantity = $1
    FROM products p
    WHERE ci.id = $2 AND ci.user_id = $3 AND p.id = ci.product_id AND p.stock >= $1
    RETURNING ci.*
  `, [quantity, id, userId]);
  return result.rows[0];
};

const removeCartItem = async (id, userId) => {
  const result = await pool.query(
    "DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId]
  );
  return result.rows[0];
};

const clearCart = async (userId) => {
  await pool.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
};

module.exports = { getCartItems, addToCart, updateCartItem, removeCartItem, clearCart };
