const pool = require("../db");

const getAllProducts = async () => {
  const query = `
    SELECT p.*, c.name AS category
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const createProduct = async ({
  name,
  description,
  price,
  stock,
  category_id,
  main_image_url,
}) => {
  const query = `
    INSERT INTO products
      (name, description, price, stock, category_id, main_image_url)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [
    name,
    description,
    price,
    stock,
    category_id,
    main_image_url,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};
const updateProduct = async (id, fields) => {
  const allowedFields = [
    "name",
    "description",
    "price",
    "stock",
    "category_id",
    "main_image_url",
  ];

  const updates = Object.keys(fields)
    .filter((key) => allowedFields.includes(key));

  if (updates.length === 0) return null;

  const setClause = updates
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  const values = updates.map((key) => fields[key]);

  const query = `
    UPDATE products
    SET ${setClause}
    WHERE id = $${updates.length + 1}
    RETURNING *
  `;

  const result = await pool.query(query, [...values, id]);
  return result.rows[0];
};

const deleteProduct  = async (id)=>{
  const query = `
    DELETE FROM products
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
}
module.exports = {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct
};
