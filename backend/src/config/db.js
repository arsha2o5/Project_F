import { createPool } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Create a connection pool to the MySQL database
const db = createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME,
});


export default db;