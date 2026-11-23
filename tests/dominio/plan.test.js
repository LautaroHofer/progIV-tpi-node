import { test } from 'node:test';
import assert from 'node:assert';
import { Plan } from '../../src/models/Plan.js';
import { schemas } from '../../src/validators/schemas.js';

test('dominio: Plan inicializa con todos los campos', () => {
  const plan = new Plan({
    id: 'p1',
    nombre: 'Plan Básico',
    cantidadClases: 8,
    precio: 5000,
    vigenciaMeses: 3,
    creadoEn: '2026-11-20T10:00:00Z',
  });
  assert.strictEqual(plan.id, 'p1');
  assert.strictEqual(plan.nombre, 'Plan Básico');
  assert.strictEqual(plan.cantidadClases, 8);
  assert.strictEqual(plan.precio, 5000);
  assert.strictEqual(plan.vigenciaMeses, 3);
  assert.strictEqual(plan.creadoEn, '2026-11-20T10:00:00Z');
});

test('dominio: Plan acepta vigenciaMeses personalizada', () => {
  const plan = new Plan({
    id: 'p2',
    nombre: 'Plan Anual',
    cantidadClases: 50,
    precio: 15000,
    vigenciaMeses: 12,
  });
  assert.strictEqual(plan.vigenciaMeses, 12);
});

test('dominio: esquema Joi acepta plan válido', () => {
  const { error, value } = schemas.plan.validate({
    nombre: 'Plan Premium',
    cantidadClases: 20,
    precio: 10000,
    vigenciaMeses: 6,
  });
  assert.ifError(error);
  assert.strictEqual(value.nombre, 'Plan Premium');
  assert.strictEqual(value.cantidadClases, 20);
  assert.strictEqual(value.precio, 10000);
  assert.strictEqual(value.vigenciaMeses, 6);
});

test('dominio: esquema Joi rechaza nombre vacío', () => {
  const { error } = schemas.plan.validate({
    nombre: '',
    cantidadClases: 5,
    precio: 5000,
    vigenciaMeses: 3,
  });
  assert.ok(error);
  assert.ok(error.details.some((d) => d.message.includes('nombre')));
});

test('dominio: esquema Joi rechaza cantidadClases menor o igual a 0', () => {
  const { error } = schemas.plan.validate({
    nombre: 'Plan X',
    cantidadClases: 0,
    precio: 5000,
    vigenciaMeses: 3,
  });
  assert.ok(error);
  assert.ok(error.details.some((d) => d.message.includes('cantidadClases')));
});

test('dominio: esquema Joi rechaza precio menor o igual a 0', () => {
  const { error } = schemas.plan.validate({
    nombre: 'Plan X',
    cantidadClases: 5,
    precio: 0,
    vigenciaMeses: 3,
  });
  assert.ok(error);
  assert.ok(error.details.some((d) => d.message.includes('precio')));
});

test('dominio: esquema Joi requiere todos los campos', () => {
  const { error } = schemas.plan.validate({}, { abortEarly: false });
  assert.ok(error);
  const paths = error.details.map((d) => d.path.join('.'));
  assert.ok(paths.some((p) => p === 'nombre'));
  assert.ok(paths.some((p) => p === 'cantidadClases'));
  assert.ok(paths.some((p) => p === 'precio'));
  assert.ok(paths.some((p) => p === 'vigenciaMeses'));
});
