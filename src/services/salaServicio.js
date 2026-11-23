import { db } from '../db/conexion.js';
import { ErrorConflicto, ErrorNoEncontrado } from '../middlewares/errores.js';

const COLECCION_SALAS = 'salas';
const COLECCION_SUCURSALES = 'sucursales';

// Verifica que la sucursal exista antes de asociarle una sala
async function verificarSucursalExiste(sucursalId) {
  const sucursalDoc = await db.collection(COLECCION_SUCURSALES).doc(sucursalId).get();
  if (!sucursalDoc.exists) {
    throw new ErrorNoEncontrado('Sucursal no encontrada');
  }
}

// Crear sala validando que la sucursal exista y que el nombre no se repita en esa sucursal
export async function crearSala({ sucursalId, nombre, capacidad, equipamiento = '' }) {
  const sucursalIdLimpio = sucursalId.trim();
  const nombreLimpio = nombre.trim();

  await verificarSucursalExiste(sucursalIdLimpio);

  const existente = await db
    .collection(COLECCION_SALAS)
    .where('sucursalId', '==', sucursalIdLimpio)
    .where('nombre', '==', nombreLimpio)
    .limit(1)
    .get();

  if (!existente.empty) {
    throw new ErrorConflicto('Ya existe una sala con ese nombre en esta sucursal');
  }

  const nuevaSala = {
    sucursalId: sucursalIdLimpio,
    nombre: nombreLimpio,
    capacidad,
    equipamiento: equipamiento.trim(),
    creadoEn: new Date().toISOString(),
  };

  const docRef = await db.collection(COLECCION_SALAS).add(nuevaSala);
  return { id: docRef.id, ...nuevaSala };
}

// Listar salas (con filtro opcional por sucursalId)
export async function listarSalas(sucursalId) {
  let consulta = db.collection(COLECCION_SALAS);
  if (sucursalId) {
    consulta = consulta.where('sucursalId', '==', sucursalId.trim());
  }

  const snapshot = await consulta.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Obtener una sala por ID
export async function obtenerSalaPorId(id) {
  const doc = await db.collection(COLECCION_SALAS).doc(id).get();
  if (!doc.exists) {
    throw new ErrorNoEncontrado('Sala no encontrada');
  }
  return { id: doc.id, ...doc.data() };
}

// Actualizar una sala existente
export async function actualizarSala(id, { sucursalId, nombre, capacidad, equipamiento = '' }) {
  const docRef = db.collection(COLECCION_SALAS).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new ErrorNoEncontrado('Sala no encontrada');
  }

  const sucursalIdLimpio = sucursalId.trim();
  const nombreLimpio = nombre.trim();
  const actual = doc.data();

  if (actual.sucursalId !== sucursalIdLimpio) {
    await verificarSucursalExiste(sucursalIdLimpio);
  }

  if (actual.nombre !== nombreLimpio || actual.sucursalId !== sucursalIdLimpio) {
    const ocupado = await db
      .collection(COLECCION_SALAS)
      .where('sucursalId', '==', sucursalIdLimpio)
      .where('nombre', '==', nombreLimpio)
      .limit(1)
      .get();

    if (!ocupado.empty && ocupado.docs[0].id !== id) {
      throw new ErrorConflicto('Ya existe otra sala con ese nombre en esta sucursal');
    }
  }

  const datosActualizados = {
    sucursalId: sucursalIdLimpio,
    nombre: nombreLimpio,
    capacidad,
    equipamiento: equipamiento.trim(),
    actualizadoEn: new Date().toISOString(),
  };

  await docRef.update(datosActualizados);
  return { id, ...actual, ...datosActualizados };
}

// Eliminar una sala por ID
export async function eliminarSala(id) {
  const docRef = db.collection(COLECCION_SALAS).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new ErrorNoEncontrado('Sala no encontrada');
  }

  await docRef.delete();
  return { mensaje: 'Sala eliminada correctamente' };
}
