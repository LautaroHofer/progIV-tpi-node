import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import * as alumnoServicio from '../../src/services/alumnoServicio.js';

test('CRUD Alumno: ciclo completo en Firestore', async (t) => {
  const tieneCredenciales =
    Boolean(process.env.FIRESTORE_EMULATOR_HOST) ||
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) ||
    fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json');

  if (!tieneCredenciales) {
    t.skip('Prueba de integración omitida: se requiere Firestore Emulator o serviceAccountKey.json');
    return;
  }

  const timestamp = Date.now();
  const testEmail = `test_alumno_${timestamp}@ejemplo.com`;
  const nombreOriginal = `Alumno Test ${timestamp}`;
  let alumnoId;

  // 1. Crear alumno
  const creado = await alumnoServicio.crearAlumno({
    nombre: nombreOriginal,
    email: testEmail,
  });

  assert.ok(creado.id, 'Debe devolver un ID generado');
  assert.strictEqual(creado.nombre, nombreOriginal);
  assert.strictEqual(creado.email, testEmail);
  assert.strictEqual(creado.creditos, 0, 'Debe iniciar con 0 créditos');
  alumnoId = creado.id;

  try {
    // 2. Intentar crear con el mismo email debe fallar (409)
    await assert.rejects(
      async () => {
        await alumnoServicio.crearAlumno({
          nombre: 'Otro nombre',
          email: testEmail,
        });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 409);
        return true;
      },
      'Debe rechazar email duplicado con 409'
    );

    // 3. Obtener por ID
    const obtenido = await alumnoServicio.obtenerAlumnoPorId(alumnoId);
    assert.strictEqual(obtenido.id, alumnoId);
    assert.strictEqual(obtenido.nombre, nombreOriginal);

    // 4. Actualizar nombre
    const nombreActualizado = `Alumno Modificado ${timestamp}`;
    const actualizado = await alumnoServicio.actualizarAlumno(alumnoId, {
      nombre: nombreActualizado,
      email: testEmail,
    });
    assert.strictEqual(actualizado.nombre, nombreActualizado);

    // 5. Listar alumnos y encontrar el creado
    const lista = await alumnoServicio.listarAlumnos();
    const encontrado = lista.find((a) => a.id === alumnoId);
    assert.ok(encontrado, 'El alumno debe aparecer en la lista');
  } finally {
    // 6. Eliminar alumno (cleanup)
    if (alumnoId) {
      const eliminado = await alumnoServicio.eliminarAlumno(alumnoId);
      assert.strictEqual(eliminado.mensaje, 'Alumno eliminado correctamente');

      // Verificar que ya no existe (404)
      await assert.rejects(
        async () => {
          await alumnoServicio.obtenerAlumnoPorId(alumnoId);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 404);
          return true;
        }
      );
    }
  }
});
