const pool = require("../db");

const addImage = async (product_id, image_url, is_main = false) => {
  const query = `
    INSERT INTO product_images (product_id, image_url, is_main)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await pool.query(query, [product_id, image_url, is_main]);
  return result.rows[0];
};

const getImagesByProduct = async (product_id) => {
  const query = `
    SELECT id, image_url, is_main
    FROM product_images
    WHERE product_id = $1
    ORDER BY is_main DESC, created_at ASC
  `;
  const result = await pool.query(query, [product_id]);
  return result.rows;
};

module.exports = {
  addImage,
  getImagesByProduct,
};
