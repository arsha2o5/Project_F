import { Router } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { verifyToken } from "../middleware/auth.js";
dotenv.config();

const router = Router();

import { getWellness } from "../controllers/wellnessControls.js";
import { getWellnessById } from "../controllers/wellnessControls.js";
import { postWellness } from "../controllers/wellnessControls.js";
import { updateWellness } from "../controllers/wellnessControls.js";

router.get("/getWellness", getWellness);
router.get("/getWellnessById", verifyToken, getWellnessById);
router.put("/updateWellness", verifyToken, updateWellness);
router.post("/addWellness", postWellness);

export default router;
