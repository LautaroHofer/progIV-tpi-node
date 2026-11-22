import { db } from '../db/conexion.js';
import { ErrorConflicto, ErrorNoEncontrado } from '../middlewares/errores.js';

const COLECCION_SUCURSALES = 'sucursales';

// Crear sucursal validando que no exista otra con el mismo nombre
export async function crearSucursal({ nombre, direccion, zonaHoraria }) {
  const nombreLimpio = nombre.trim();
  const existente = await db
    .collection(COLECCION_SUCURSALES)
    .where('nombre', '==', nombreLimpio)
    .limit(1)
    .get();

  if (!existente.empty) {
    throw new ErrorConflicto('Ya existe una sucursal registrada con ese nombre');
  }

  const nuevaSucursal = {
    nombre: nombreLimpio,
    direccion: direccion.trim(),
    zonaHoraria: zonaHoraria.trim(),
    creadoEn: new Date().toISOString(),
  };

  const docRef = await db.collection(COLECCION_SUCURSALES).add(nuevaSucursal);
  return { id: docRef.id, ...nuevaSucursal };
}

// Listar todas las sucursales
export async function listarSucursales() {
  const snapshot = await db.collection(COLECCION_SUCURSALES).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Obtener una sucursal por ID
export async function obtenerSucursalPorId(id) {
  const doc = await db.collection(COLECCION_SUCURSALES).doc(id).get();
  if (!doc.exists) {
    throw new ErrorNoEncontrado('Sucursal no encontrada');
  }
  return { id: doc.id, ...doc.data() };
}

// Actualizar sucursal existente
export async function actualizarSucursal(id, { nombre, direccion, zonaHoraria }) {
  const docRef = db.collection(COLECCION_SUCURSALES).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new ErrorNoEncontrado('Sucursal no encontrada');
  }

  const nombreLimpio = nombre.trim();
  if (doc.data().nombre !== nombreLimpio) {
    const ocupado = await db
      .collection(COLECCION_SUCURSALES)
      .where('nombre', '==', nombreLimpio)
      .limit(1)
      .get();
    if (!ocupado.empty && ocupado.docs[0].id !== id) {
      throw new ErrorConflicto('Ya existe otra sucursal con ese nombre');
    }
  }

  const datosActualizados = {
    nombre: nombreLimpio,
    direccion: direccion.trim(),
    zonaHoraria: zonaHoraria.trim(),
    actualizadoEn: new Date().toISOString(),
  };

  await docRef.update(datosActualizados);
  return { id, ...doc.data(), ...datosActualizados };
}

// Eliminar sucursal por ID
export async function eliminarSucursal(id) {
  const docRef = db.collection(COLECCION_SUCURSALES).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new ErrorNoEncontrado('Sucursal no encontrada');
  }
  await docRef.delete();
  return { mensaje: 'Sucursal eliminada correctamente' };
}
