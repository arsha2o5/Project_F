import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function login(req, res) {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [email]
        );

    const user = rows[0];

    if (!user) {
        return res.status(401).json({
            error: "Invalid email"
        });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        res.status(401).json({ error: "Invalid password" });
        return;
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);

    res.json({
        token,
        userId: user.id
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
        return;
    }
}