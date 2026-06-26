import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(json());

import userRoutes from "./routes/user.js";
import wellnessRoutes from "./routes/wellness.js";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/AI.js"

app.use("/user/", userRoutes);
app.use("/auth/", authRoutes);
app.use("/wellness/", wellnessRoutes);
app.use("/", aiRoutes);

// Port
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});