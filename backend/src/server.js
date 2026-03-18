const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const useRouter = require("./routes/user");
app.use("/api/users", useRouter);

// Middleware
app.use(cors());
app.use(express.json());

// Test route


// Port
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});