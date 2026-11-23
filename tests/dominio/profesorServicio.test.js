import { test } from 'node:test';
import assert from 'node:assert';
import {
  crearProfesor,
  listarProfesores,
  obtenerProfesorPorId,
} from '../../src/services/profesorServicio.js';

function crearDbMock(docsIniciales = []) {
  let documentos = docsIniciales.map((d) => ({ ...d }));

  return {
    collection: (nombre) => {
      if (nombre !== 'profesores') {
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

test('servicio: crear profesor con db mock', async () => {
  const db = crearDbMock([]);
  const profesor = await crearProfesor({ nombre: 'Juan Pérez', email: 'juan@mail.com' }, db);
  assert.ok(profesor.id);
  assert.strictEqual(profesor.nombre, 'Juan Pérez');
  assert.strictEqual(profesor.email, 'juan@mail.com');
});

test('servicio: rechazar crear profesor con email duplicado (409)', async () => {
  const db = crearDbMock([
    { id: 'p1', nombre: 'Juan Pérez', email: 'juan@mail.com', creadoEn: '2026-01-01' },
  ]);
  await assert.rejects(
    () => crearProfesor({ nombre: 'Otro', email: 'JUAN@MAIL.COM' }, db),
    (err) => err.statusCode === 409
  );
});

test('servicio: listar profesores vacíos con db mock', async () => {
  const db = crearDbMock([]);
  const profesores = await listarProfesores(db);
  assert.deepStrictEqual(profesores, []);
});

test('servicio: obtener profesor por id existente', async () => {
  const db = crearDbMock([
    { id: 'p1', nombre: 'Juan Pérez', email: 'juan@mail.com', creadoEn: '2026-01-01' },
  ]);
  const profesor = await obtenerProfesorPorId('p1', db);
  assert.strictEqual(profesor.id, 'p1');
  assert.strictEqual(profesor.nombre, 'Juan Pérez');
});

test('servicio: rechazar obtener profesor inexistente (404)', async () => {
  const db = crearDbMock([]);
  await assert.rejects(() => obtenerProfesorPorId('inexistente', db), (err) => err.statusCode === 404);
});
