const mysql = require("mysql2/promise");
require('dotenv').config();

// Create a connection pool to the MySQL database
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "56de26272",
    database: "project_f_db"
});


module.exports = db;