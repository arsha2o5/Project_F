import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import dotenv from "dotenv";

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