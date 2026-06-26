import { query } from "../config/db.js";

async function test() {
  const [rows] = await query("SELECT * FROM pet_types");
  console.log(rows);
}

test();