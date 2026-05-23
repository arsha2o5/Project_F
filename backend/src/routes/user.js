import { Router } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

import { getUsers } from "../controllers/userControls.js";
import { getUserById } from "../controllers/userControls.js";
import { getUserPets } from "../controllers/userControls.js";
import { postUser } from "../controllers/userControls.js";

router.get("/", getUsers);

router.post("/", postUser);

router.get("/:id", getUserById);

router.get("/:id/pets", getUserPets);


export default router;