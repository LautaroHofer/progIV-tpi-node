import { test } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';

import {
  requiereAuth,
  requiereRol,
  requierePermiso,
  extraerTokenBearer,
} from '../../src/middlewares/auth.js';

const TEST_SECRET = 'clave-secreta-de-prueba-con-al-menos-32-bytes';

function crearMockRes() {
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

function crearMockReq(token) {
  const req = { headers: {} };
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }
  return req;
}

function crearToken(payload, secret = TEST_SECRET) {
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '15m' });
}

test('seguridad: extraerTokenBearer retorna null sin header', () => {
  const req = { headers: {} };
  assert.strictEqual(extraerTokenBearer(req), null);
});

test('seguridad: extraerTokenBearer retorna null sin prefijo Bearer', () => {
  const req = { headers: { authorization: 'otro-token' } };
  assert.strictEqual(extraerTokenBearer(req), null);
});

test('seguridad: extraerTokenBearer extrae el token con Bearer', () => {
  const req = { headers: { authorization: 'Bearer mi-token-123' } };
  assert.strictEqual(extraerTokenBearer(req), 'mi-token-123');
});

test('seguridad: requiereAuth rechaza sin header Authorization', async () => {
  const req = crearMockReq();
  const res = crearMockRes();
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  await requiereAuth(req, res, next);

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
  assert.ok(res.body.error);
});

test('seguridad: requiereAuth rechaza token firmado con otro secreto', async () => {
  const token = crearToken({ sub: 'u1', rol: 'alumno' }, 'otro-secreto-distinto');
  const req = crearMockReq(token);
  const res = crearMockRes();
  let nextCalled = false;

  // Usamos el secreto de prueba para el middleware
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = TEST_SECRET;

  await requiereAuth(req, res, () => { nextCalled = true; });

  process.env.JWT_SECRET = originalSecret;

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
});

test('seguridad: requiereAuth rechaza token expirado', async () => {
  const token = jwt.sign(
    { sub: 'u1', rol: 'alumno' },
    TEST_SECRET,
    { algorithm: 'HS256', expiresIn: '-5m' }
  );
  const req = crearMockReq(token);
  const res = crearMockRes();

  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = TEST_SECRET;

  await requiereAuth(req, res, () => {});

  process.env.JWT_SECRET = originalSecret;

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.error, 'Token expirado');
});

test('seguridad: requiereAuth rechaza algoritmo none', async () => {
  const tokenSinFirma = jwt.sign({ sub: 'u1', rol: 'admin' }, null, { algorithm: 'none' });
  const req = crearMockReq(tokenSinFirma);
  const res = crearMockRes();

  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = TEST_SECRET;

  await requiereAuth(req, res, () => {});

  process.env.JWT_SECRET = originalSecret;

  assert.strictEqual(res.statusCode, 401);
});

test('seguridad: requiereAuth devuelve 500 si falta JWT_SECRET en servidor', async () => {
  const token = crearToken({ sub: 'u1', rol: 'alumno' });
  const req = crearMockReq(token);
  const res = crearMockRes();

  const originalSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  await requiereAuth(req, res, () => {});

  process.env.JWT_SECRET = originalSecret;

  assert.strictEqual(res.statusCode, 500);
});

test('seguridad: requiereAuth permite token válido y adjunta usuario', async () => {
  const token = crearToken({ sub: 'usr_123', rol: 'alumno' });
  const req = crearMockReq(token);
  const res = crearMockRes();
  let nextCalled = false;

  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = TEST_SECRET;

  await requiereAuth(req, res, () => { nextCalled = true; });

  process.env.JWT_SECRET = originalSecret;

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.usuario.sub, 'usr_123');
  assert.strictEqual(req.usuario.rol, 'alumno');
});

test('seguridad: requiereRol rechaza rol no permitido con 403', async () => {
  const token = crearToken({ sub: 'prof_1', rol: 'profesor' });
  const req = crearMockReq(token);
  req.usuario = { sub: 'prof_1', rol: 'profesor' };
  const res = crearMockRes();
  let nextCalled = false;

  await requiereRol(['alumno', 'admin'])(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextCalled, false);
});

test('seguridad: requiereRol permite rol autorizado', async () => {
  const req = crearMockReq();
  req.usuario = { sub: 'alu_1', rol: 'alumno' };
  const res = crearMockRes();
  let nextCalled = false;

  await requiereRol(['alumno', 'admin'])(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, true);
});

test('seguridad: requierePermiso rechaza si falta permiso requerido', async () => {
  const req = crearMockReq();
  req.usuario = { sub: 'alu_1', permisos: ['reservas:listar'] };
  const res = crearMockRes();
  let nextCalled = false;

  await requierePermiso('reservas:crear')(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextCalled, false);
});

test('seguridad: requierePermiso permite si tiene el permiso requerido', async () => {
  const req = crearMockReq();
  req.usuario = { sub: 'alu_1', permisos: ['reservas:listar', 'reservas:crear'] };
  const res = crearMockRes();
  let nextCalled = false;

  await requierePermiso('reservas:crear')(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, true);
});
