import { test } from 'node:test';
import assert from 'node:assert';
import {
  crearPlan,
  listarPlanes,
  obtenerPlanPorId,
  actualizarPlan,
  eliminarPlan,
} from '../../src/services/planServicio.js';

function crearDbMock(docsIniciales = []) {
  let documentos = docsIniciales.map((d) => ({ ...d }));

  return {
    collection: (nombre) => {
      if (nombre !== 'planes') {
        throw new Error(`Colección no mockada: ${nombre}`);
      }

      const coleccion = {
        doc: (id) => {
          const encontrado = documentos.find((d) => d.id === id);
          return {
            get: async () => ({
              exists: !!encontrado,
              data: () => encontrado || {},
              id,
            }),
            update: async (datos) => {
              const idx = documentos.findIndex((d) => d.id === id);
              if (idx !== -1) {
                documentos[idx] = { ...documentos[idx], ...datos };
              }
            },
            delete: async () => {
              documentos = documentos.filter((d) => d.id !== id);
            },
          };
        },
        where: (campo, operador, valor) => ({
          limit: (n) => ({
            get: async () => {
              const filtrados = documentos.filter((d) => d[campo] === valor);
              return {
                empty: filtrados.length === 0,
                docs: filtrados.slice(0, n).map((d) => ({
                  id: d.id,
                  data: () => d,
                })),
              };
            },
          }),
        }),
        add: async (doc) => {
          const nuevo = { ...doc, id: `doc_${documentos.length + 1}` };
          documentos.push(nuevo);
          return { id: nuevo.id };
        },
        get: async () => ({
          docs: documentos.map((d) => ({
            id: d.id,
            data: () => d,
          })),
        }),
      };

      return coleccion;
    },
  };
}

test('servicio: crear plan con db mock', async () => {
  const db = crearDbMock([]);
  const plan = await crearPlan(
    { nombre: 'Plan Básico', cantidadClases: 8, precio: 5000, vigenciaMeses: 3 },
    db
  );
  assert.ok(plan.id);
  assert.strictEqual(plan.nombre, 'Plan Básico');
});

test('servicio: rechazar crear plan con nombre duplicado (409)', async () => {
  const db = crearDbMock([
    { id: 'p1', nombre: 'Plan Existente', cantidadClases: 5, precio: 3000, vigenciaMeses: 2 },
  ]);
  await assert.rejects(
    () =>
      crearPlan(
        { nombre: 'Plan Existente', cantidadClases: 5, precio: 3000, vigenciaMeses: 2 },
        db
      ),
    (err) => err.statusCode === 409
  );
});

test('servicio: listar planes vacíos con db mock', async () => {
  const db = crearDbMock([]);
  const planes = await listarPlanes(db);
  assert.deepStrictEqual(planes, []);
});

test('servicio: obtener plan por id existente', async () => {
  const db = crearDbMock([
    { id: 'p1', nombre: 'Plan Test', cantidadClases: 5, precio: 3000, vigenciaMeses: 2 },
  ]);
  const plan = await obtenerPlanPorId('p1', db);
  assert.strictEqual(plan.id, 'p1');
  assert.strictEqual(plan.nombre, 'Plan Test');
});

test('servicio: rechazar obtener plan inexistente (404)', async () => {
  const db = crearDbMock([]);
  await assert.rejects(() => obtenerPlanPorId('inexistente', db), (err) => err.statusCode === 404);
});

test('servicio: actualizar plan existente', async () => {
  const db = crearDbMock([
    {
      id: 'p1',
      nombre: 'Plan Viejo',
      cantidadClases: 5,
      precio: 3000,
      vigenciaMeses: 2,
    },
  ]);
  const actualizado = await actualizarPlan(
    'p1',
    { nombre: 'Plan Nuevo', cantidadClases: 10, precio: 5000, vigenciaMeses: 6 },
    db
  );
  assert.strictEqual(actualizado.nombre, 'Plan Nuevo');
  assert.strictEqual(actualizado.cantidadClases, 10);
});

test('servicio: rechazar actualizar plan inexistente (404)', async () => {
  const db = crearDbMock([]);
  await assert.rejects(
    () =>
      actualizarPlan(
        'inexistente',
        { nombre: 'X', cantidadClases: 1, precio: 1, vigenciaMeses: 1 },
        db
      ),
    (err) => err.statusCode === 404
  );
});

test('servicio: rechazar actualizar con nombre duplicado (409)', async () => {
  const db = crearDbMock([
    { id: 'p1', nombre: 'Plan A', cantidadClases: 5, precio: 3000, vigenciaMeses: 2 },
    { id: 'p2', nombre: 'Plan B', cantidadClases: 5, precio: 3000, vigenciaMeses: 2 },
  ]);
  await assert.rejects(
    () =>
      actualizarPlan('p1', { nombre: 'Plan B', cantidadClases: 5, precio: 3000, vigenciaMeses: 2 }, db),
    (err) => err.statusCode === 409
  );
});

test('servicio: eliminar plan existente', async () => {
  const db = crearDbMock([
    { id: 'p1', nombre: 'Plan A', cantidadClases: 5, precio: 3000, vigenciaMeses: 2 },
  ]);
  const resultado = await eliminarPlan('p1', db);
  assert.strictEqual(resultado.mensaje, 'Plan eliminado correctamente');

  await assert.rejects(() => obtenerPlanPorId('p1', db), (err) => err.statusCode === 404);
});

test('servicio: rechazar eliminar plan inexistente (404)', async () => {
  const db = crearDbMock([]);
  await assert.rejects(() => eliminarPlan('inexistente', db), (err) => err.statusCode === 404);
});
