const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "Arsen",
    user: "root",
    password: process.env.DBPassword,
    database: "project_f_db"
});

module.exports = db;