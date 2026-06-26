import { Router } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

import { aiFoodCalc } from "../controllers/aiFoodCalc.js";

router.post("/aiFoodCalc",aiFoodCalc);


export default router;