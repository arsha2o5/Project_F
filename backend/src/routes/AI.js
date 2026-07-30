import { Router } from "express";
import cors from "cors";
import dotenv from "dotenv";
import {upload} from "../config/multerConfig.js"
import { verifyToken } from "../middleware/auth.js";


dotenv.config();

const router = Router();

import { aiFoodCalc } from "../controllers/aiControls.js";
import { aiGeneratePet } from "../controllers/aiControls.js";

router.post("/aiFoodCalc", aiFoodCalc);
router.post("/aiGeneratePet", verifyToken, upload.single("image"), aiGeneratePet)

export default router;