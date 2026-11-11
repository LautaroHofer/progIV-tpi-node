import { test } from 'node:test';
import assert from 'node:assert';
import { db } from '../../src/db/conexion.js';

test('integración: la instancia de Firestore está inicializada', () => {
  assert.ok(db, 'La instancia de Firestore debe estar definida');
  assert.strictEqual(typeof db.collection, 'function', 'db debe tener el método collection()');
});
