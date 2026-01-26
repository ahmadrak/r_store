const pool = require("../db");

const getAllCategories = async () => {
  const query = `SELECT * FROM categories ORDER BY id`;
  const result = await pool.query(query);
  return result.rows;
};

const createCategory = async ({ name }) => {
  const query = `
    INSERT INTO categories (name)
    VALUES ($1)
    RETURNING *
  `;
  const result = await pool.query(query, [name]);
  return result.rows[0];
};

const updateCategory = async (id, { name }) => {
  const query = `
    UPDATE categories
    SET name = $1
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [name, id]);
  return result.rows[0];
};

const deleteCategory = async (id) => {
  const query = `
    DELETE FROM categories
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
