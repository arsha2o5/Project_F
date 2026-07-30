import db from "../config/db.js";
import bcrypt from "bcrypt";
export async function getUsers(req, res) {
  const [rows] = await db.query("SELECT * FROM users");
  res.json(rows);
}

export async function getUserById(req, res) {
  const userId = req.params.id;
  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
  res.json(rows[0]);
}

export async function getUserPets(req, res) {
  const userId = req.params.id;
  const [rows] = await db.query("SELECT * FROM user_pets WHERE owner_id = ?", [userId]);
  res.json(rows);
}

// POST /users
export async function postUser(req, res) {
  try {
  const { username, display_name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before storing it

  const [result] = await db.execute(
    `
    INSERT INTO users (username, display_name, email, password)
    VALUES (?, ?, ?, ?)
    `,
    [username, display_name, email, hashedPassword]
  );

  const userId = result.insertId;

  await db.execute(
    `
    INSERT INTO wellness_data (user_id)
    VALUES (?)
    `,
    [userId]
  );
  await db.execute(
    `
    INSERT INTO pets (user_id, neutral_image, happy_image, sad_image)
    VALUES (?, ?, ?, ?)
    `,
    [userId, "/uploads/defaults/neutral.png", "/uploads/defaults/happy.png", "/uploads/defaults/sad.png"]
  );

  res.status(201).json({
    id: userId,
    username,
    display_name,
    email    
  });
} catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
            error:
                "Username or email already exists"
        });
    }

    console.error(error);

    res.status(500).json({
        error: "Server error"
    });
  }
}