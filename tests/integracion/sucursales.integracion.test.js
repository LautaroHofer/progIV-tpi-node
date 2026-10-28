import { test, assert } from 'node:test';
import { pool } from '../../src/infra/db/conexion.js';

test('integración: se puede consultar sucursales', async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT COUNT(*) FROM sucursales');
    assert.ok(Number(result.rows[0].count) >= 0);
  } finally {
    client.release();
  }
});
