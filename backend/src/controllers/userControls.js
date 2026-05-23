import db from "../config/db.js";

export async function getUsers(req, res) {
  const [rows] = await db.query("SELECT * FROM USERS");
  res.json(rows);
}

export async function getUserById(req, res) {
  const userId = req.params.id;
  const [rows] = await db.query("SELECT * FROM USERS WHERE id = ?", [userId]);
  res.json(rows[0]);
}

export async function getUserPets(req, res) {
  const userId = req.params.id;
  const [rows] = await db.query("SELECT * FROM user_pets WHERE owner_id = ?", [userId]);
  res.json(rows);
}

// POST /users
export async function postUser(req, res) {
  const { username, email, password } = req.body;
  const result = await db.execute(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password]
  );
  res.json({ id: result.insertId, username, email });
}