import { execute } from "../config/db.js";

const createUser = async (username, email, password) => {
  const [result] = await execute(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password]
  );
  return result;
};

export default { createUser };