import { test } from 'node:test';
import assert from 'node:assert';
import Alumno from '../../src/models/Alumno.js';
import { schemas } from '../../src/validators/schemas.js';

test('dominio: Alumno inicializa con creditos en 0 por defecto', () => {
  const alumno = new Alumno({ id: 'a1', nombre: 'Juan', email: 'juan@mail.com' });
  assert.strictEqual(alumno.id, 'a1');
  assert.strictEqual(alumno.nombre, 'Juan');
  assert.strictEqual(alumno.email, 'juan@mail.com');
  assert.strictEqual(alumno.creditos, 0);
});

test('dominio: Alumno acepta creditos personalizados', () => {
  const alumno = new Alumno({
    id: 'a2',
    nombre: 'Ana',
    email: 'ana@mail.com',
    creditos: 5,
  });
  assert.strictEqual(alumno.creditos, 5);
});

test('dominio: Alumno acepta fecha de creación opcional', () => {
  const fecha = '2026-11-20T10:00:00Z';
  const alumno = new Alumno({
    id: 'a3',
    nombre: 'Luis',
    email: 'luis@mail.com',
    creadoEn: fecha,
  });
  assert.strictEqual(alumno.creadoEn, fecha);
});

test('dominio: esquema Joi acepta nombre y email válidos', () => {
  const { error, value } = schemas.alumno.validate({
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
  });
  assert.ifError(error);
  assert.strictEqual(value.nombre, 'Juan Pérez');
  assert.strictEqual(value.email, 'juan@example.com');
});

test('dominio: esquema Joi rechaza nombre vacío', () => {
  const { error } = schemas.alumno.validate({
    nombre: '',
    email: 'juan@example.com',
  });
  assert.ok(error);
  assert.ok(error.details.some((d) => d.message.includes('nombre')));
});

test('dominio: esquema Joi rechaza email inválido', () => {
  const { error } = schemas.alumno.validate({
    nombre: 'Juan',
    email: 'no-es-un-email',
  });
  assert.ok(error);
  assert.ok(error.details.some((d) => d.message.includes('email')));
});

test('dominio: esquema Joi rechaza nombre mayor a 100 caracteres', () => {
  const nombreLargo = 'A'.repeat(101);
  const { error } = schemas.alumno.validate({
    nombre: nombreLargo,
    email: 'juan@example.com',
  });
  assert.ok(error);
  assert.ok(error.details.some((d) => d.message.includes('nombre')));
});

test('dominio: esquema Joi requiere nombre y email', () => {
  const { error } = schemas.alumno.validate({});
  assert.ok(error);
  assert.ok(error.details.some((d) => d.path.includes('nombre')));
  assert.ok(error.details.some((d) => d.path.includes('email')));
});
