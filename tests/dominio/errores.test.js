import { test } from 'node:test';
import assert from 'node:assert';
import {
  ErrorValidacion,
  ErrorNoAutorizado,
  ErrorProhibido,
  ErrorNoEncontrado,
  ErrorConflicto,
} from '../../src/middlewares/errores.js';
import { manejadorErrores } from '../../src/middlewares/error.js';

function crearResMock() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

test('errores propios: asignan statusCode y codigo correctos', () => {
  assert.strictEqual(new ErrorValidacion('Dato malo').statusCode, 400);
  assert.strictEqual(new ErrorNoAutorizado().statusCode, 401);
  assert.strictEqual(new ErrorProhibido().statusCode, 403);
  assert.strictEqual(new ErrorNoEncontrado('No existe').statusCode, 404);
  assert.strictEqual(new ErrorConflicto('Duplicado').statusCode, 409);
});

test('manejadorErrores: traduce ErrorApp a su status HTTP y oculta errores internos 500', () => {
  const res404 = crearResMock();
  manejadorErrores(new ErrorNoEncontrado('Alumno no encontrado'), {}, res404, () => {});
  assert.strictEqual(res404.statusCode, 404);
  assert.deepStrictEqual(res404.body, {
    error: 'Alumno no encontrado',
    codigo: 'NO_ENCONTRADO',
    correlationId: null,
  });

  const res500 = crearResMock();
  manejadorErrores(new Error('Detalle interno sensible de Firestore'), {}, res500, () => {});
  assert.strictEqual(res500.statusCode, 500);
  assert.strictEqual(res500.body.error, 'Error interno del servidor');
  assert.strictEqual(res500.body.codigo, 'ERROR_INTERNO');
  assert.strictEqual(res500.body.correlationId, null);
});
