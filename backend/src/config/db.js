import { createPool } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Create a connection pool to the MySQL database
const db = createPool({
    host: process.env.DBHost,
    user: process.env.DBUser,
    password: process.env.DBPassword,
    database: process.env.DBName,
});


export default db;