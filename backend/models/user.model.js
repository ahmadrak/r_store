const pool = require("../db");
const bcrypt = require("bcryptjs");

const createUser = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role
  `;
  const result = await pool.query(query, [name, email, hashedPassword, "user"]);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role FROM users ORDER BY id ASC`
  );
  return result.rows;
};

const updateUser = async (id, fields) => {
  const allowed = ["name", "email", "role"];
  const keys = Object.keys(fields).filter((k) => allowed.includes(k) && fields[k] !== undefined);

  if (keys.length === 0) return null;

  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const values = keys.map((key) => fields[key]);

  const query = `
    UPDATE users
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    RETURNING id, name, email, role
  `;
  const result = await pool.query(query, [...values, id]);
  return result.rows[0];
};

const updatePassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const result = await pool.query(
    `UPDATE users SET password = $1 WHERE id = $2 RETURNING id, name, email, role`,
    [hashedPassword, id]
  );
  return result.rows[0];
};

const deleteUser = async (id) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING id, name, email, role`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  updateUser,
  updatePassword,
  deleteUser,
};