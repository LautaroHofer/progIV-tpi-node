import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { schemas } from '../../src/validators/schemas.js';
import { db } from '../../src/db/conexion.js';
import * as alumnoServicio from '../../src/services/alumnoServicio.js';
import * as creditoServicio from '../../src/services/creditoServicio.js';

test('creditos: validacion Joi rechaza cantidad negativa o campos extra', () => {
  const ok = schemas.creditoDescontar.validate({ cantidad: 1, motivo: 'Reserva clase' });
  assert.strictEqual(ok.error, undefined);

  const negativa = schemas.creditoDescontar.validate({ cantidad: -2 });
  assert.ok(negativa.error, 'Debe rechazar cantidad negativa');

  const extra = schemas.creditoAgregar.validate(
    { cantidad: 5, campoExtra: true },
    { stripUnknown: false }
  );
  assert.ok(extra.error, 'Debe rechazar campos no declarados');
});

test('creditos: transaccion, idempotencia y vencimiento en Firestore', async (t) => {
  const tieneCredenciales =
    Boolean(process.env.FIRESTORE_EMULATOR_HOST) ||
    Boolean(process.env.FB_SERVICE_ACCOUNT_KEY) ||
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) ||
    fs.existsSync(process.env.FB_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json');

  if (!tieneCredenciales) {
    t.skip('Omitido: se requiere Firestore Emulator o serviceAccountKey.json');
    return;
  }

  const ts = Date.now();
  const alumno = await alumnoServicio.crearAlumno({
    nombre: `Alumno Creditos ${ts}`,
    email: `creditos_${ts}@ejemplo.com`,
  });

  const claves = [`desc_${ts}`, `dev_${ts}`, `venc_${ts}`];
  const movIds = [];

  try {
    // 1. Agregar 5 créditos
    const agr = await creditoServicio.agregarCreditos({
      alumnoId: alumno.id,
      cantidad: 5,
      motivo: 'Plan inicial',
    });
    movIds.push(agr.movimientoId);
    assert.strictEqual(agr.saldoNuevo, 5);

    // 2. Descontar 1 crédito con Idempotency-Key y repetir la misma clave
    const d1 = await creditoServicio.descontarCreditos({
      alumnoId: alumno.id,
      cantidad: 1,
      motivo: 'Reserva Pilates',
      idempotencyKey: claves[0],
    });
    movIds.push(d1.movimientoId);
    assert.strictEqual(d1.saldoNuevo, 4);

    const d2 = await creditoServicio.descontarCreditos({
      alumnoId: alumno.id,
      cantidad: 1,
      motivo: 'Reserva Pilates',
      idempotencyKey: claves[0],
    });
    assert.strictEqual(d2.idempotente, true);
    assert.strictEqual((await creditoServicio.obtenerSaldo(alumno.id)).creditos, 4);

    // 3. Devolver 1 crédito y repetir la misma clave (no debe devolver dos veces)
    const r1 = await creditoServicio.devolverCreditos({
      alumnoId: alumno.id,
      cantidad: 1,
      motivo: 'Cancelacion en ventana',
      idempotencyKey: claves[1],
    });
    movIds.push(r1.movimientoId);
    assert.strictEqual(r1.saldoNuevo, 5);

    const r2 = await creditoServicio.devolverCreditos({
      alumnoId: alumno.id,
      cantidad: 1,
      motivo: 'Cancelacion en ventana',
      idempotencyKey: claves[1],
    });
    assert.strictEqual(r2.idempotente, true);
    assert.strictEqual((await creditoServicio.obtenerSaldo(alumno.id)).creditos, 5);

    // 4. Crédito vencido no revive
    const venc = await creditoServicio.devolverCreditos({
      alumnoId: alumno.id,
      cantidad: 1,
      motivo: 'Devolucion tardia',
      fechaVencimiento: '2020-01-01T00:00:00.000Z',
      idempotencyKey: claves[2],
    });
    movIds.push(venc.movimientoId);
    assert.strictEqual(venc.devuelto, false);
    assert.strictEqual((await creditoServicio.obtenerSaldo(alumno.id)).creditos, 5);

    // 5. Saldo insuficiente -> 409
    await assert.rejects(
      () =>
        creditoServicio.descontarCreditos({
          alumnoId: alumno.id,
          cantidad: 10,
          idempotencyKey: `insuf_${ts}`,
        }),
      (err) => err.statusCode === 409
    );
  } finally {
    await alumnoServicio.eliminarAlumno(alumno.id);
    for (const id of movIds) {
      await db.collection('movimientos_creditos').doc(id).delete();
    }
    for (const key of claves) {
      await db.collection('idempotencia_creditos').doc(key).delete();
    }
  }
});
