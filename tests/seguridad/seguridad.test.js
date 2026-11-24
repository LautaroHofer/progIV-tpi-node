import { test } from 'node:test';
import assert from 'node:assert';
import { crearApp } from '../../src/app.js';
import { rateLimitLogin } from '../../src/middlewares/seguridad.js';

async function iniciarServidorTest() {
  const app = crearApp();
  const servidor = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = servidor.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    cerrar: () => new Promise((resolve) => servidor.close(resolve)),
  };
}

test('seguridad: agrega cabeceras defensivas y oculta X-Powered-By', async () => {
  const { baseUrl, cerrar } = await iniciarServidorTest();
  try {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
    assert.strictEqual(res.headers.get('referrer-policy'), 'no-referrer');
    assert.strictEqual(res.headers.get('content-security-policy'), "default-src 'none'");
    assert.strictEqual(res.headers.get('x-powered-by'), null);
  } finally {
    await cerrar();
  }
});

test('seguridad: CORS permite origenes configurados y rechaza origenes no permitidos', async () => {
  const { baseUrl, cerrar } = await iniciarServidorTest();
  try {
    const permitido = await fetch(`${baseUrl}/health`, {
      headers: { Origin: 'http://localhost:3000' },
    });
    assert.strictEqual(permitido.status, 200);
    assert.strictEqual(permitido.headers.get('access-control-allow-origin'), 'http://localhost:3000');

    const rechazado = await fetch(`${baseUrl}/health`, {
      headers: { Origin: 'https://atacante.ejemplo.com' },
    });
    assert.strictEqual(rechazado.status, 403);
    const cuerpo = await rechazado.json();
    assert.strictEqual(cuerpo.codigo, 'CORS_NO_PERMITIDO');
  } finally {
    await cerrar();
  }
});

test('seguridad: rechaza payloads con __proto__ y constructor.prototype', async () => {
  const { baseUrl, cerrar } = await iniciarServidorTest();
  try {
    const resProto = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email":"a@b.com","__proto__":{"esAdmin":true}}',
    });
    assert.strictEqual(resProto.status, 400);
    assert.strictEqual(({}).esAdmin, undefined);

    const resConstructor = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"extra":{"constructor":{"prototype":{"contaminado":true}}}}',
    });
    assert.strictEqual(resConstructor.status, 400);
    assert.strictEqual(({}).contaminado, undefined);
  } finally {
    await cerrar();
  }
});

test('seguridad: rate limit en /api/auth/login devuelve 429 tras superar el limite', async () => {
  rateLimitLogin.reiniciar();
  const { baseUrl, cerrar } = await iniciarServidorTest();
  try {
    for (let i = 0; i < 10; i += 1) {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalido' }),
      });
      assert.strictEqual(res.status, 400);
    }

    const bloqueado = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalido' }),
    });
    assert.strictEqual(bloqueado.status, 429);
    assert.ok(bloqueado.headers.get('retry-after'));
    const cuerpo = await bloqueado.json();
    assert.strictEqual(cuerpo.codigo, 'LIMITE_EXCEDIDO');
  } finally {
    rateLimitLogin.reiniciar();
    await cerrar();
  }
});
