const db = require("../config/db");

async function test() {
  const [rows] = await db.query("SELECT * FROM pet_types");
  console.log(rows);
}

test();