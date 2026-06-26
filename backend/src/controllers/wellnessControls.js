import db from "../config/db.js";

export async function getWellness(req, res) {
  const [rows] = await db.query("SELECT * FROM WELLNESS_DATA");      
  res.json(rows);
}

export async function getWellnessById(req, res) {
    const userId = req.user.id;

    const [rows] = await db.execute(
            `
            SELECT * FROM wellness_data
            WHERE user_id = ?
            `,
            [userId]
        );

    res.json(rows[0]);
}


export async function postWellness(req, res) {
    const { name, location, size } = req.body;
    const result = await db.execute(
    "INSERT INTO wellness_data (name, location, size) VALUES (?, ?, ?)",
    [name, location, size]
    );
    res.json({ id: result.insertId, name, location, size });
}
export async function updateWellness(req, res) {
    const userId = req.user.id; // Get the user ID from the verified token
    const wellnessId = req.params.id;

    const { food, water, energy } = req.body;

    await db.execute(
        `
        UPDATE wellness_data
        SET food = ?, water = ?, energy = ? WHERE user_id = ?
        `,
        [
            food,
            water,
            energy,
            userId
        ]
    );

    res.json({
        message: `Wellness updated for user ${userId}`
    });
}
