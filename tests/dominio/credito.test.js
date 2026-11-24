import { test } from 'node:test';
import assert from 'node:assert';
import { Credito } from '../../src/models/Credito.js';
import { schemas } from '../../src/validators/schemas.js';

test('dominio: Credito inicializa con todos los campos', () => {
  const credito = new Credito({
    id: 'c1',
    alumnoId: 'a1',
    cantidad: 5,
    tipo: 'credito',
    motivo: 'Compra de plan basico',
    fecha: '2026-11-20T10:00:00Z',
  });
  assert.strictEqual(credito.id, 'c1');
  assert.strictEqual(credito.alumnoId, 'a1');
  assert.strictEqual(credito.cantidad, 5);
  assert.strictEqual(credito.tipo, 'credito');
  assert.strictEqual(credito.motivo, 'Compra de plan basico');
  assert.strictEqual(credito.fecha, '2026-11-20T10:00:00Z');
});

test('dominio: esquema Joi creditoAgregar acepta datos validos', () => {
  const { error, value } = schemas.creditoAgregar.validate({
    cantidad: 10,
    motivo: 'Pago de mensualidad',
  });
  assert.ifError(error);
  assert.strictEqual(value.cantidad, 10);
  assert.strictEqual(value.motivo, 'Pago de mensualidad');
});

test('dominio: esquema Joi creditoDescontar acepta datos validos', () => {
  const { error, value } = schemas.creditoDescontar.validate({
    cantidad: 3,
    motivo: 'Reserva de clase',
  });
  assert.ifError(error);
  assert.strictEqual(value.cantidad, 3);
  assert.strictEqual(value.motivo, 'Reserva de clase');
});

test('dominio: esquema Joi rechaza cantidad <= 0', () => {
  const { error } = schemas.creditoAgregar.validate({
    cantidad: 0,
    motivo: 'Prueba',
  });
  assert.ok(error);
  assert.ok(error.details.some((d) => d.message.includes('cantidad')));
});

test('dominio: esquema Joi rechaza motivo vacio', () => {
  const { error } = schemas.creditoAgregar.validate({
    cantidad: 5,
    motivo: '',
  });
  assert.ok(error);
  assert.ok(error.details.some((d) => d.message.includes('motivo')));
});

test('dominio: esquema Joi requiere cantidad y motivo', () => {
  const { error } = schemas.creditoAgregar.validate({}, { abortEarly: false });
  assert.ok(error);
  const paths = error.details.map((d) => d.path.join('.'));
  assert.ok(paths.some((p) => p === 'cantidad'));
  assert.ok(paths.some((p) => p === 'motivo'));
});
