const pool = require("../db");

/**
 * Get all cart items
 */
const getCartItems = async () => {
  const query = `
    SELECT 
      ci.id,
      ci.quantity,
      p.id AS product_id,
      p.name,
      p.price,
      p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    ORDER BY ci.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Add item to cart
 * If product already exists → increase quantity
 */
const addToCart = async ({ product_id, quantity }) => {
  // Check if item already in cart
  const existing = await pool.query(
    `SELECT * FROM cart_items WHERE product_id = $1`,
    [product_id]
  );

  if (existing.rows.length > 0) {
    const updated = await pool.query(
      `
      UPDATE cart_items
      SET quantity = quantity + $1
      WHERE product_id = $2
      RETURNING *
      `,
      [quantity, product_id]
    );
    return updated.rows[0];
  }

  const insert = await pool.query(
    `
    INSERT INTO cart_items (product_id, quantity)
    VALUES ($1, $2)
    RETURNING *
    `,
    [product_id, quantity]
  );

  return insert.rows[0];
};

/**
 * Update cart item quantity
 */
const updateCartItem = async (id, quantity) => {
  const query = `
    UPDATE cart_items
    SET quantity = $1
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [quantity, id]);
  return result.rows[0];
};

/**
 * Remove item from cart
 */
const removeCartItem = async (id) => {
  const query = `
    DELETE FROM cart_items
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const clearCart = async (userId) => {
  await pool.query(
    `DELETE FROM cart_items WHERE user_id = $1`,
    [userId]
  );
};


module.exports = {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
