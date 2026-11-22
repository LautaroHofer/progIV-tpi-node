import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { schemas } from '../../src/validators/schemas.js';
import * as sucursalServicio from '../../src/services/sucursalServicio.js';
import * as salaServicio from '../../src/services/salaServicio.js';

test('validacion Joi de sala: acepta datos validos y rechaza invalidos o campos extra', () => {
  const valido = schemas.sala.validate({
    sucursalId: 'sucursal-123',
    nombre: 'Sala Reformer 1',
    capacidad: 6,
    equipamiento: '6 reformers',
  });
  assert.strictEqual(valido.error, undefined);

  const capacidadCero = schemas.sala.validate({
    sucursalId: 'sucursal-123',
    nombre: 'Sala Reformer 1',
    capacidad: 0,
  });
  assert.ok(capacidadCero.error, 'Debe rechazar capacidad menor a 1');

  const conExtra = schemas.sala.validate(
    {
      sucursalId: 'sucursal-123',
      nombre: 'Sala Reformer 1',
      capacidad: 6,
      extra: true,
    },
    { stripUnknown: false }
  );
  assert.ok(conExtra.error, 'Debe rechazar campos no declarados');
});

test('CRUD Sala: ciclo completo en Firestore', async (t) => {
  const tieneCredenciales =
    Boolean(process.env.FIRESTORE_EMULATOR_HOST) ||
    Boolean(process.env.FB_SERVICE_ACCOUNT_KEY) ||
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) ||
    fs.existsSync(process.env.FB_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json');

  if (!tieneCredenciales) {
    t.skip('Omitido: se requiere Firestore Emulator o serviceAccountKey.json');
    return;
  }

  const timestamp = Date.now();
  const sucursal = await sucursalServicio.crearSucursal({
    nombre: `Sucursal Salas Test ${timestamp}`,
    direccion: 'Av. Sarmiento 500',
    zonaHoraria: 'America/Argentina/Buenos_Aires',
  });

  let salaId;

  try {
    // 1. Intentar crear sala con sucursal inexistente debe fallar (404)
    await assert.rejects(
      () =>
        salaServicio.crearSala({
          sucursalId: 'sucursal_inexistente_test',
          nombre: 'Sala Fantasma',
          capacidad: 6,
        }),
      (err) => err.statusCode === 404,
      'Debe rechazar sucursal inexistente con 404'
    );

    // 2. Crear sala valida
    const nombreSala = `Sala Reformer ${timestamp}`;
    const creada = await salaServicio.crearSala({
      sucursalId: sucursal.id,
      nombre: nombreSala,
      capacidad: 6,
      equipamiento: '6 reformers',
    });

    assert.ok(creada.id, 'Debe devolver un ID generado');
    assert.strictEqual(creada.sucursalId, sucursal.id);
    assert.strictEqual(creada.capacidad, 6);
    assert.strictEqual(creada.equipamiento, '6 reformers');
    salaId = creada.id;

    // 3. Crear otra sala con el mismo nombre en la misma sucursal debe fallar (409)
    await assert.rejects(
      () =>
        salaServicio.crearSala({
          sucursalId: sucursal.id,
          nombre: nombreSala,
          capacidad: 4,
        }),
      (err) => err.statusCode === 409,
      'Debe rechazar nombre duplicado en la misma sucursal con 409'
    );

    // 4. Obtener por ID y listar filtrando por sucursalId
    const obtenida = await salaServicio.obtenerSalaPorId(salaId);
    assert.strictEqual(obtenida.nombre, nombreSala);

    const listaSucursal = await salaServicio.listarSalas(sucursal.id);
    assert.ok(listaSucursal.some((s) => s.id === salaId));

    // 5. Actualizar capacidad y equipamiento
    const actualizada = await salaServicio.actualizarSala(salaId, {
      sucursalId: sucursal.id,
      nombre: nombreSala,
      capacidad: 8,
      equipamiento: '8 reformers',
    });
    assert.strictEqual(actualizada.capacidad, 8);
    assert.strictEqual(actualizada.equipamiento, '8 reformers');
  } finally {
    if (salaId) {
      const eliminado = await salaServicio.eliminarSala(salaId);
      assert.strictEqual(eliminado.mensaje, 'Sala eliminada correctamente');

      await assert.rejects(
        () => salaServicio.obtenerSalaPorId(salaId),
        (err) => err.statusCode === 404
      );
    }
    await sucursalServicio.eliminarSucursal(sucursal.id);
  }
});
