import { test } from "node:test";
import assert from "node:assert";
import { pool } from "../../src/db/conexion.js";

// TODO: implementar Firebase, no es con SQL

// test("integración: se puede consultar sucursales", async () => {
//   const client = await pool.connect();
//   try {
//     const result = await client.query("SELECT COUNT(*) FROM sucursales");
//     assert.ok(Number(result.rows[0].count) >= 0);
//   } finally {
//     client.release();
//   }
// });
