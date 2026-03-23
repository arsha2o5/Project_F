const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a connection pool to the MySQL database
const db = mysql.createPool({
    host: process.env.DBHost,
    user: process.env.DBUser,
    password: process.env.DBPassword,
    database: process.env.DBName,
});


module.exports = db;