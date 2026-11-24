import { test } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import { crearApp } from '../../src/app.js';
import { requierePropietarioORol } from '../../src/middlewares/auth.js';

const TEST_SECRET = 'clave-secreta-idor-test-con-suficiente-largo';

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

test('seguridad IDOR: permite acceso al propio recurso y a roles privilegiados', () => {
  const middleware = requierePropietarioORol('alumnoId');

  // Mismo alumno (sub === alumnoId)
  let pasoPropio = false;
  middleware(
    { usuario: { sub: 'alu-1', rol: 'alumno' }, params: { alumnoId: 'alu-1' } },
    crearMockRes(),
    () => { pasoPropio = true; }
  );
  assert.strictEqual(pasoPropio, true);

  // Admin accediendo a otro alumno
  let pasoAdmin = false;
  middleware(
    { usuario: { sub: 'adm-1', rol: 'admin' }, params: { alumnoId: 'alu-99' } },
    crearMockRes(),
    () => { pasoAdmin = true; }
  );
  assert.strictEqual(pasoAdmin, true);

  // Recepcionista accediendo a otro alumno
  let pasoRecep = false;
  middleware(
    { usuario: { sub: 'rec-1', rol: 'recepcionista' }, params: { alumnoId: 'alu-99' } },
    crearMockRes(),
    () => { pasoRecep = true; }
  );
  assert.strictEqual(pasoRecep, true);
});

test('seguridad IDOR: rechaza con 403 cuando un alumno intenta acceder al recurso de otro', () => {
  const middleware = requierePropietarioORol('alumnoId');
  const res = crearMockRes();
  let paso = false;

  middleware(
    { usuario: { sub: 'alu-1', rol: 'alumno' }, params: { alumnoId: 'alu-2' } },
    res,
    () => { paso = true; }
  );

  assert.strictEqual(paso, false);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.body.codigo, 'PROHIBIDO');
});

test('seguridad IDOR HTTP: /api/creditos bloquea con 403 a alumno consultando u operando sobre otro alumno', async () => {
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = TEST_SECRET;

  const app = crearApp();
  const servidor = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = servidor.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const tokenAlumno1 = jwt.sign(
    { sub: 'alu-1', rol: 'alumno' },
    TEST_SECRET,
    { algorithm: 'HS256', expiresIn: '15m' }
  );

  try {
    const headers = {
      Authorization: `Bearer ${tokenAlumno1}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': 'clave-test-idor-1',
    };

    const rSaldo = await fetch(`${baseUrl}/api/creditos/alu-2`, { headers });
    assert.strictEqual(rSaldo.status, 403);

    const rHistorial = await fetch(`${baseUrl}/api/creditos/alu-2/historial`, { headers });
    assert.strictEqual(rHistorial.status, 403);

    const rDescontar = await fetch(`${baseUrl}/api/creditos/alu-2/descontar`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ cantidad: 1, motivo: 'Intento IDOR' }),
    });
    assert.strictEqual(rDescontar.status, 403);

    const rDevolver = await fetch(`${baseUrl}/api/creditos/alu-2/devolver`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ movimientoId: 'mov-1', motivo: 'Intento IDOR' }),
    });
    assert.strictEqual(rDevolver.status, 403);
  } finally {
    await new Promise((resolve) => servidor.close(resolve));
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  }
});
