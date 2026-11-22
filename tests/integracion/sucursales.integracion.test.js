import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { schemas } from '../../src/validators/schemas.js';
import * as sucursalServicio from '../../src/services/sucursalServicio.js';

test('validacion Joi de sucursal: acepta datos validos y rechaza campos extra', () => {
  const valido = schemas.sucursal.validate({
    nombre: 'Sucursal Centro',
    direccion: 'Av. 9 de Julio 123',
    zonaHoraria: 'America/Argentina/Buenos_Aires',
  });
  assert.strictEqual(valido.error, undefined);

  const conExtra = schemas.sucursal.validate(
    { nombre: 'A', direccion: 'B', zonaHoraria: 'UTC', extra: 1 },
    { stripUnknown: false }
  );
  assert.ok(conExtra.error, 'Debe rechazar campos no declarados');
});

test('CRUD Sucursal: ciclo completo en Firestore', async (t) => {
  const tieneCredenciales =
    Boolean(process.env.FIRESTORE_EMULATOR_HOST) ||
    Boolean(process.env.FB_SERVICE_ACCOUNT_KEY) ||
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) ||
    fs.existsSync(process.env.FB_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json');

  if (!tieneCredenciales) {
    t.skip('Omitido: se requiere Firestore Emulator o serviceAccountKey.json');
    return;
  }

  const nombre = `Sucursal Test ${Date.now()}`;
  const creada = await sucursalServicio.crearSucursal({
    nombre,
    direccion: 'Calle Falsa 123',
    zonaHoraria: 'America/Argentina/Buenos_Aires',
  });
  assert.ok(creada.id);

  try {
    await assert.rejects(
      () => sucursalServicio.crearSucursal({ nombre, direccion: 'Otra', zonaHoraria: 'UTC' }),
      (err) => err.statusCode === 409
    );
    const obtenida = await sucursalServicio.obtenerSucursalPorId(creada.id);
    assert.strictEqual(obtenida.nombre, nombre);

    const actualizada = await sucursalServicio.actualizarSucursal(creada.id, {
      nombre,
      direccion: 'Nueva Dir 456',
      zonaHoraria: 'America/Argentina/Buenos_Aires',
    });
    assert.strictEqual(actualizada.direccion, 'Nueva Dir 456');
  } finally {
    await sucursalServicio.eliminarSucursal(creada.id);
  }
});
