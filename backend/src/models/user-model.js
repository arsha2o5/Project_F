const db = require("../config/db");

const createUser = async (username, email, password) => {
  const [result] = await db.execute(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password]
  );
  return result;
};

module.exports = { createUser };