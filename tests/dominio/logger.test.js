import { test } from 'node:test';
import assert from 'node:assert';
import { middlewareLogger, obtenerCorrelationId } from '../../src/middlewares/logger.js';

function ejecutarMiddleware(headers = {}) {
  return new Promise((resolve) => {
    const resHeaders = {};
    let finishCallback = null;

    const req = { method: 'GET', url: '/health', headers };
    const res = {
      statusCode: 200,
      setHeader(nombre, valor) {
        resHeaders[nombre] = valor;
      },
      on(evento, cb) {
        if (evento === 'finish') finishCallback = cb;
      },
    };

    middlewareLogger(req, res, async () => {
      const idAntes = obtenerCorrelationId();
      await new Promise((r) => setTimeout(r, 15));
      const idDespues = obtenerCorrelationId();
      if (finishCallback) finishCallback();
      resolve({ resHeaders, idAntes, idDespues });
    });
  });
}

test('logger: genera X-Correlation-Id y lo mantiene aislado en pedidos concurrentes', async () => {
  const [pedidoA, pedidoB] = await Promise.all([
    ejecutarMiddleware({ 'x-correlation-id': 'req-aaa' }),
    ejecutarMiddleware({ 'x-correlation-id': 'req-bbb' }),
  ]);

  assert.strictEqual(pedidoA.idAntes, 'req-aaa');
  assert.strictEqual(pedidoA.idDespues, 'req-aaa');
  assert.strictEqual(pedidoA.resHeaders['X-Correlation-Id'], 'req-aaa');

  assert.strictEqual(pedidoB.idAntes, 'req-bbb');
  assert.strictEqual(pedidoB.idDespues, 'req-bbb');
  assert.strictEqual(pedidoB.resHeaders['X-Correlation-Id'], 'req-bbb');
});

test('logger: genera un UUID automáticamente cuando no viene header', async () => {
  const resultado = await ejecutarMiddleware();
  assert.ok(resultado.idAntes, 'Debe generar un correlationId');
  assert.strictEqual(resultado.idAntes, resultado.idDespues);
  assert.strictEqual(resultado.resHeaders['X-Correlation-Id'], resultado.idAntes);
});
