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

function crearMockReq(authorization) {
  const req = { headers: {} };
  if (authorization) {
    req.headers.authorization = authorization;
  }
  return req;
}

function crearToken(payload, secret = TEST_SECRET) {
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '15m' });
}

function conSecreto(secret, fn) {
  const original = process.env.JWT_SECRET;
  process.env.JWT_SECRET = secret;
  try {
    return fn();
  } finally {
    process.env.JWT_SECRET = original;
  }
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

test('seguridad: extraerTokenBearer admite Bearer en mayúsculas y minúsculas', () => {
  const reqMayus = { headers: { authorization: 'BEARER mi-token-123' } };
  const reqMinus = { headers: { authorization: 'bearer mi-token-123' } };
  assert.strictEqual(extraerTokenBearer(reqMayus), 'mi-token-123');
  assert.strictEqual(extraerTokenBearer(reqMinus), 'mi-token-123');
});

test('seguridad: extraerTokenBearer rechaza múltiples espacios sin token', () => {
  const req = { headers: { authorization: 'Bearer   ' } };
  assert.strictEqual(extraerTokenBearer(req), null);
});

test('seguridad: extraerTokenBearer rechaza tres partes', () => {
  const req = { headers: { authorization: 'Bearer token extra' } };
  assert.strictEqual(extraerTokenBearer(req), null);
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

test('seguridad: requiereAuth rechaza Bearer con múltiples espacios y sin token', async () => {
  const req = crearMockReq('Bearer   ');
  const res = crearMockRes();
  let nextCalled = false;

  await conSecreto(TEST_SECRET, async () => {
    await requiereAuth(req, res, () => { nextCalled = true; });
  });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
});

test('seguridad: requiereAuth rechaza token firmado con otro secreto', async () => {
  const token = crearToken({ sub: 'u1', rol: 'alumno' }, 'otro-secreto-distinto');
  const req = crearMockReq(`Bearer ${token}`);
  const res = crearMockRes();
  let nextCalled = false;

  await conSecreto(TEST_SECRET, async () => {
    await requiereAuth(req, res, () => { nextCalled = true; });
  });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
});

test('seguridad: requiereAuth rechaza token expirado', async () => {
  const token = jwt.sign(
    { sub: 'u1', rol: 'alumno' },
    TEST_SECRET,
    { algorithm: 'HS256', expiresIn: '-5m' }
  );
  const req = crearMockReq(`Bearer ${token}`);
  const res = crearMockRes();

  await conSecreto(TEST_SECRET, async () => {
    await requiereAuth(req, res, () => {});
  });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.error, 'Token expirado');
});

test('seguridad: requiereAuth rechaza algoritmo none', async () => {
  const tokenSinFirma = jwt.sign({ sub: 'u1', rol: 'admin' }, null, { algorithm: 'none' });
  const req = crearMockReq(`Bearer ${tokenSinFirma}`);
  const res = crearMockRes();

  await conSecreto(TEST_SECRET, async () => {
    await requiereAuth(req, res, () => {});
  });

  assert.strictEqual(res.statusCode, 401);
});

test('seguridad: requiereAuth rechaza algoritmo HS384', async () => {
  const token = jwt.sign({ sub: 'u1', rol: 'alumno' }, TEST_SECRET, { algorithm: 'HS384' });
  const req = crearMockReq(`Bearer ${token}`);
  const res = crearMockRes();

  await conSecreto(TEST_SECRET, async () => {
    await requiereAuth(req, res, () => {});
  });

  assert.strictEqual(res.statusCode, 401);
});

test('seguridad: requiereAuth rechaza algoritmo RS256', async () => {
  const { generateKeyPairSync } = await import('node:crypto');
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  const token = jwt.sign({ sub: 'u1', rol: 'alumno' }, privateKey, { algorithm: 'RS256' });
  const req = crearMockReq(`Bearer ${token}`);
  const res = crearMockRes();

  await conSecreto(TEST_SECRET, async () => {
    await requiereAuth(req, res, () => {});
  });

  assert.strictEqual(res.statusCode, 401);
});

test('seguridad: requiereAuth devuelve 500 si falta JWT_SECRET en servidor', async () => {
  const token = crearToken({ sub: 'u1', rol: 'alumno' });
  const req = crearMockReq(`Bearer ${token}`);
  const res = crearMockRes();

  await conSecreto(undefined, async () => {
    delete process.env.JWT_SECRET;
    await requiereAuth(req, res, () => {});
  });

  assert.strictEqual(res.statusCode, 500);
});

test('seguridad: requiereAuth permite token válido y adjunta usuario', async () => {
  const token = crearToken({ sub: 'usr_123', rol: 'alumno' });
  const req = crearMockReq(`Bearer ${token}`);
  const res = crearMockRes();
  let nextCalled = false;

  await conSecreto(TEST_SECRET, async () => {
    await requiereAuth(req, res, () => { nextCalled = true; });
  });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.usuario.sub, 'usr_123');
  assert.strictEqual(req.usuario.rol, 'alumno');
});

test('seguridad: requiereAuth permite token válido sin rol ni permisos en payload', async () => {
  const token = crearToken({ sub: 'usr_456' });
  const req = crearMockReq(`Bearer ${token}`);
  const res = crearMockRes();
  let nextCalled = false;

  await conSecreto(TEST_SECRET, async () => {
    await requiereAuth(req, res, () => { nextCalled = true; });
  });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.usuario.sub, 'usr_456');
  assert.strictEqual(req.usuario.rol, undefined);
});

test('seguridad: requiereRol rechaza rol no permitido con 403', async () => {
  const req = crearMockReq();
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

test('seguridad: requiereRol rechaza cuando usuario no tiene rol', async () => {
  const req = crearMockReq();
  req.usuario = { sub: 'alu_1' };
  const res = crearMockRes();
  let nextCalled = false;

  await requiereRol(['alumno', 'admin'])(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextCalled, false);
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

test('seguridad: requierePermiso rechaza cuando usuario no tiene permisos', async () => {
  const req = crearMockReq();
  req.usuario = { sub: 'alu_1' };
  const res = crearMockRes();
  let nextCalled = false;

  await requierePermiso('reservas:crear')(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextCalled, false);
});
