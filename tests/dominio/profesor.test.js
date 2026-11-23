import { test } from 'node:test';
import assert from 'node:assert';
import { Profesor } from '../../src/models/Profesor.js';
import { schemas } from '../../src/validators/schemas.js';

test('dominio: Profesor inicializa con nombre, email y creadoEn', () => {
  const profesor = new Profesor({
    id: 'p1',
    nombre: 'Juan Pérez',
    email: 'juan@mail.com',
    creadoEn: '2026-11-20T10:00:00Z',
  });
  assert.strictEqual(profesor.id, 'p1');
  assert.strictEqual(profesor.nombre, 'Juan Pérez');
  assert.strictEqual(profesor.email, 'juan@mail.com');
  assert.strictEqual(profesor.creadoEn, '2026-11-20T10:00:00Z');
});

test('dominio: esquema Joi acepta nombre y email válidos', () => {
  const { error, value } = schemas.profesor.validate({
    nombre: 'María Gómez',
    email: 'maria@example.com',
  });
  assert.ifError(error);
  assert.strictEqual(value.nombre, 'María Gómez');
  assert.strictEqual(value.email, 'maria@example.com');
});

test('dominio: esquema Joi rechaza nombre vacío', () => {
  const { error } = schemas.profesor.validate({
    nombre: '',
    email: 'juan@example.com',
  });
  assert.ok(error);
  assert.ok(error.details.some((d) => d.message.includes('nombre')));
});

test('dominio: esquema Joi rechaza email inválido', () => {
  const { error } = schemas.profesor.validate({
    nombre: 'Juan',
    email: 'no-es-un-email',
  });
  assert.ok(error);
  assert.ok(error.details.some((d) => d.message.includes('email')));
});

test('dominio: esquema Joi rechaza nombre mayor a 100 caracteres', () => {
  const nombreLargo = 'A'.repeat(101);
  const { error } = schemas.profesor.validate({
    nombre: nombreLargo,
    email: 'juan@example.com',
  });
  assert.ok(error);
  assert.ok(error.details.some((d) => d.message.includes('nombre')));
});

test('dominio: esquema Joi requiere nombre y email', () => {
  const { error } = schemas.profesor.validate({}, { abortEarly: false });
  assert.ok(error);
  const paths = error.details.map((d) => d.path.join('.'));
  assert.ok(paths.some((p) => p === 'nombre'));
  assert.ok(paths.some((p) => p === 'email'));
});
