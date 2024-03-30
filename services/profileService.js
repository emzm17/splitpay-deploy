// services/ProfileService.js
const db = require('../utils/database'); // Assuming db is your database connection
const bcryptjs = require('bcryptjs');

const getUserByEmail = async (email) => {
  return db.query('SELECT * FROM users WHERE email = $1', [email]);
};

const updateUser = async (id, name, email, hashedPassword) => {
  return db.query('UPDATE users SET name = $1, email = $2, password = $3 WHERE user_id = $4', [name, email, hashedPassword, id]);
};

module.exports = {
  getUserByEmail,
  updateUser,
};
