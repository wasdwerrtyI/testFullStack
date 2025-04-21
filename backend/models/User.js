const mongoose = require("mongoose");
/**
 * @typedef User
 * @property {string} username - Unique username
 * @property {string} password - Hashed password
 */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
