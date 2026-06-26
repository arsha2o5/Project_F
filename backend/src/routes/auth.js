import { Router } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

import { login } from "../controllers/authControls.js";

router.post("/login", login);


export default router;