import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import OpenAI, {toFile} from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { removeBackgroundFromImageBase64 } from "remove.bg";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY
})

export async function aiFoodCalc(req, res){
    try{

        const meal = req.body.meal

        const response = await client.responses.create({

        model: "gpt-5-mini",

        input: `
        Based on the given input of food intake, return a json object with the estimated calorie level of that meal and the certainty of your calculation ranging from low to high

        Return ONLY JSON.

        The JSON format should look like this:
        {
        "calories": number,
        "certainty": low/medium/high
        }

        Meal:
        ${meal}
        `
        });

        res.json(JSON.parse(response.output_text))

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to analyze meal." });
    }
}

async function generatePetState(userImage, state, userId) {
    const response = await client.images.edit({
        model: "gpt-image-1",
        image: [userImage],
        size: "1024x1024",
        prompt: `
Generate a ${state} illustration of the pet in the provided image.

Preserve the pet's identity, markings, proportions, anatomy, and facial features.
Create a highly recognizable semi-realistic illustration.
Centered on a white background.
Feet on the ground.
No text.
No cartoonish or anime style eyes.
If the uploaded image does not contain an animal, generate a golden retriever instead.
`
    });
const base64 = response.data[0].b64_json
const result = await removeBackgroundFromImageBase64({
        base64img: base64,
        apiKey: process.env.FURNESS_BG_REMOVER_KEY,
        type: "animal",
        format: "png"
    });
const transparentBuffer = Buffer.from(result.base64img, "base64");

await fs.writeFile(
    `uploads/pets/${userId}_${state}.png`,
    transparentBuffer
);
    return result.base64img;
}

export async function aiGeneratePet(req, res) {
    try {
        // const styleGuide = await toFile(
        //     await fs.readFile(
        //         path.resolve("assets/FurnessStyleGuide.png")
        //     ),
        //     "FurnessStyleGuide.png",
        //     {
        //         type: "image/png"
        //     }
        // );

        const userImage = await toFile(
            req.file.buffer,
            "pet.jpg",
            {
                type: req.file.mimetype,
            }
        );
        const userId = req.user.id
        if (!userId) throw new Error("No user ID")
        
        const [neutral, happy, sad] = await Promise.all([
            generatePetState(userImage, "neutral", userId),
            generatePetState(userImage, "happy", userId),
            generatePetState(userImage, "sad", userId)
        ]);

        res.json({
            neutral,
            happy,
            sad
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Image generation failed."
        });
    }
}
