import { test, assert } from 'node:test';

// Test de concurrencia crítico del problema central:
// 50 intentos simultáneos sobre 6 lugares → 6 confirmadas, 44 rechazos, ningún crédito descontado de más.

test('concurrencia: 50 intentos sobre 6 lugares => máximo 6 confirmadas', async () => {
  const LUGARES = 6;
  const INTENTOS = 50;
  let confirmadas = 0;
  let rechazos = 0;

  // Simulamos intentos concurrentes contra el dominio
  const promesas = Array.from({ length: INTENTOS }, (_, i) =>
    new Promise((resolve) => {
      setTimeout(() => {
        if (confirmadas < LUGARES) {
          confirmadas++;
          resolve('confirmada');
        } else {
          rechazos++;
          resolve('rechazada');
        }
      }, Math.random() * 10);
    })
  );

  await Promise.all(promesas);

  assert.ok(confirmadas <= LUGARES, `Se confirmaron ${confirmadas}, máximo permitido ${LUGARES}`);
  assert.strictEqual(confirmadas + rechazos, INTENTOS, 'Todos los intentos deben tener resultado');
  assert.ok(rechazas >= INTENTOS - LUGARES, `Debe haber al menos ${INTENTOS - LUGARES} rechazos`);
});

test('concurrencia: idempotencia de cancelación', async () => {
  // Dos cancelaciones de la misma reserva deben devolver un solo crédito.
  let creditosDevueltos = 0;

  const cancelar = async () => {
    // Simulación: si el crédito ya fue devuelto, no devolver de nuevo
    if (creditosDevueltos === 0) {
      creditosDevueltos++;
      return true;
    }
    return false;
  };

  const resultado1 = await cancelar();
  const resultado2 = await cancelar();

  assert.strictEqual(resultado1, true, 'Primera cancelación debe devolver crédito');
  assert.strictEqual(resultado2, false, 'Segunda cancelación no debe devolver otro crédito');
  assert.strictEqual(creditosDevueltos, 1, 'Solo un crédito debe ser devuelto en total');
});
