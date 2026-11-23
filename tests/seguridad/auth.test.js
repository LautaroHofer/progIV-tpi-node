import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import jwt from 'jsonwebtoken';
import { schemas } from '../../src/validators/schemas.js';
import { db } from '../../src/db/conexion.js';
import { config } from '../../src/config/env.js';
import * as authServicio from '../../src/services/authServicio.js';

test('auth: validacion Joi de registro y login', () => {
  const ok = schemas.registro.validate({
    nombre: 'Admin Test',
    email: 'admin@ejemplo.com',
    password: 'password123',
    rol: 'admin',
  });
  assert.strictEqual(ok.error, undefined);

  const corta = schemas.registro.validate({
    nombre: 'Admin',
    email: 'admin@ejemplo.com',
    password: '123',
  });
  assert.ok(corta.error, 'Debe rechazar contraseñas menores a 6 caracteres');

  const rolMalo = schemas.registro.validate({
    nombre: 'Admin',
    email: 'admin@ejemplo.com',
    password: 'password123',
    rol: 'superhacker',
  });
  assert.ok(rolMalo.error, 'Debe rechazar roles no permitidos');
});

test('auth: registro con bcryptjs y login con JWT en Firestore', async (t) => {
  const tieneCredenciales =
    Boolean(process.env.FIRESTORE_EMULATOR_HOST) ||
    Boolean(process.env.FB_SERVICE_ACCOUNT_KEY) ||
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) ||
    fs.existsSync(process.env.FB_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json');

  if (!tieneCredenciales) {
    t.skip('Omitido: se requiere Firestore Emulator o serviceAccountKey.json');
    return;
  }

  const email = `test_auth_${Date.now()}@ejemplo.com`;
  const password = 'claveSegura123';
  const creado = await authServicio.registrarUsuario({
    nombre: 'Usuario Auth Test',
    email,
    password,
    rol: 'admin',
  });

  assert.ok(creado.id);
  assert.strictEqual(creado.passwordHash, undefined, 'Nunca debe devolver el hash');

  try {
    await assert.rejects(
      () => authServicio.registrarUsuario({ nombre: 'Dup', email, password }),
      (err) => err.statusCode === 409
    );

    const { token, usuario } = await authServicio.iniciarSesion({ email, password });
    assert.ok(token);
    assert.strictEqual(usuario.rol, 'admin');

    const payload = jwt.verify(token, process.env.JWT_SECRET || config.jwtSecret, {
      algorithms: ['HS256'],
    });
    assert.strictEqual(payload.sub, creado.id);
    assert.strictEqual(payload.rol, 'admin');

    await assert.rejects(
      () => authServicio.iniciarSesion({ email, password: 'otraPassword' }),
      (err) => err.statusCode === 401
    );
  } finally {
    await db.collection('usuarios').doc(creado.id).delete();
  }
});
