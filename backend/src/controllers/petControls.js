import { log } from "console";
import db from "../config/db.js";
import fs from "fs/promises";
import path from "path";

export async function getPetByID(req, res){
    const { userId } = req.params;

    const [rows] = await db.query(
        "SELECT * FROM pets WHERE user_id = ?",
        [userId]
    );

    if (!rows.length) {
        return res.status(404).json({ error: "No pet found" });
    }

    const pet = rows[0];

    res.json({
        neutral: `http://ec2-18-144-66-250.us-west-1.compute.amazonaws.com:5000${pet.neutral_image}`,
        happy: `http://ec2-18-144-66-250.us-west-1.compute.amazonaws.com:5000${pet.happy_image}`,
        sad: `http://ec2-18-144-66-250.us-west-1.compute.amazonaws.com:5000${pet.sad_image}`
    });
};

export async function saveGeneratedPet(req, res){
    const userId = req.user?.id;
    const { neutral, happy, sad } = req.body;
    console.log("reached controller for save");
    
    if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
    }

    if (!neutral || !happy || !sad) {
        return res.status(400).json({ error: "Missing pet images." });
    }

    const basePath = path.join(process.cwd(), "uploads/pets");
    await fs.mkdir(basePath, { recursive: true });

    const neutralPath = path.join(basePath, `${userId}_neutral.png`);
    const happyPath = path.join(basePath, `${userId}_happy.png`);
    const sadPath = path.join(basePath, `${userId}_sad.png`);

    await saveBase64Image(neutral, neutralPath);
    await saveBase64Image(happy, happyPath);
    await saveBase64Image(sad, sadPath);

    const imagePaths = {
        neutral: `/uploads/pets/${userId}_neutral.png`,
        happy: `/uploads/pets/${userId}_happy.png`,
        sad: `/uploads/pets/${userId}_sad.png`
    };

    const [updateResult] = await db.query(
        `UPDATE pets
         SET neutral_image = ?, happy_image = ?, sad_image = ?
         WHERE user_id = ?`,
        [
            imagePaths.neutral,
            imagePaths.happy,
            imagePaths.sad,
            userId
        ]
    );

    if (updateResult.affectedRows === 0) {
        await db.query(
            `INSERT INTO pets (user_id, neutral_image, happy_image, sad_image)
             VALUES (?, ?, ?, ?)`,
            [
                userId,
                imagePaths.neutral,
                imagePaths.happy,
                imagePaths.sad
            ]
        );
    }

    res.json({ success: true });
}


///////////////////////////////////////////////
// Helpers
///////////////////////////////////////////////

export async function saveBase64Image(base64Data, filename) {
    // Remove the data URI header if it exists (e.g., "data:image/png;base64,...")
    const base64Image = base64Data.split(';base64,').pop();
    
    // Convert to a binary buffer
    const buffer = Buffer.from(base64Image, "base64");
    
    // Save to the specified path
    await fs.writeFile(filename, buffer);
    console.log(`Successfully saved: ${filename}`);
}