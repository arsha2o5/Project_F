import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

const app = express();

const uploadDir = path.join(process.cwd(), "../uploads/pets");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Pet uploads directory created.");
}

// Middleware
app.use(cors());
app.use(json({ limit: "10mb" }));

import userRoutes from "./routes/user.js";
import wellnessRoutes from "./routes/wellness.js";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/AI.js"
import petRoutes from "./routes/petRoutes.js"

app.use("/user/", userRoutes);
app.use("/auth/", authRoutes);
app.use("/wellness/", wellnessRoutes);
app.use("/", aiRoutes);
app.use("/pet", petRoutes)
app.use("/uploads", express.static("uploads"))

// Port
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});