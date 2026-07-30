import { Router } from "express";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

import { verifyToken } from "../middleware/auth.js";
import { saveGeneratedPet } from "../controllers/petControls.js";
import { getPetByID } from "../controllers/petControls.js";

router.put("/save", verifyToken, saveGeneratedPet);
router.get("/:userId", getPetByID);



export default router;