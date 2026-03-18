const express = require("express");
const cors = require("cors");
require("dotenv").config();

const router = express.Router();

const { getUsers } = require("../controllers/userControls");

router.get("/", getUsers);

module.exports = router;