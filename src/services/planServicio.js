import { db } from "../db/conexion.js";
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorValidacion,
} from "../middlewares/errores.js";

const COLECCION_PLANES = "planes";

// Crear un nuevo plan
export async function crearPlan({ nombre, cantidadClases, precio, vigenciaMeses }, dbInyectado = db) {
  const nombreLimpio = nombre.trim();

  // verificar que no exista otro plan con el mismo nombre
  const existente = await dbInyectado
    .collection(COLECCION_PLANES)
    .where("nombre", "==", nombreLimpio)
    .limit(1)
    .get();

  if (!existente.empty) {
    throw new ErrorConflicto("Ya existe un plan registrado con ese nombre");
  }

  const nuevoPlan = {
    nombre: nombreLimpio,
    cantidadClases: Number(cantidadClases),
    precio: Number(precio),
    vigenciaMeses: Number(vigenciaMeses),
    creadoEn: new Date().toISOString(),
  };

  const docRef = await dbInyectado.collection(COLECCION_PLANES).add(nuevoPlan);
  return { id: docRef.id, ...nuevoPlan };
}

// Listar todos los planes
export async function listarPlanes(dbInyectado = db) {
  const snapshot = await dbInyectado.collection(COLECCION_PLANES).get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Obtener un plan por ID
export async function obtenerPlanPorId(id, dbInyectado = db) {
  const doc = await dbInyectado.collection(COLECCION_PLANES).doc(id).get();
  if (!doc.exists) {
    throw new ErrorNoEncontrado("Plan no encontrado");
  }
  return { id: doc.id, ...doc.data() };
}

// Actualizar un plan existente (actualización parcial permitida)
export async function actualizarPlan(id, { nombre, cantidadClases, precio, vigenciaMeses }, dbInyectado = db) {
  const docRef = dbInyectado.collection(COLECCION_PLANES).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new ErrorNoEncontrado("Plan no encontrado");
  }

  const datosActuales = doc.data();
  const datosActualizados = {};
  let hayCambios = false;

  // Solo actualizar los campos que realmente vinieron en el request
  if (nombre !== undefined) {
    const nombreLimpio = nombre.trim();

    if (datosActuales.nombre !== nombreLimpio) {
      const ocupado = await dbInyectado
        .collection(COLECCION_PLANES)
        .where("nombre", "==", nombreLimpio)
        .limit(1)
        .get();

      if (!ocupado.empty && ocupado.docs[0].id !== id) {
        throw new ErrorConflicto("El nombre ya está en uso por otro plan");
      }
    }

    datosActualizados.nombre = nombreLimpio;
    hayCambios = true;
  }

  if (cantidadClases !== undefined) {
    datosActualizados.cantidadClases = Number(cantidadClases);
    hayCambios = true;
  }

  if (precio !== undefined) {
    datosActualizados.precio = Number(precio);
    hayCambios = true;
  }

  if (vigenciaMeses !== undefined) {
    datosActualizados.vigenciaMeses = Number(vigenciaMeses);
    hayCambios = true;
  }

  // Rechazar PUT vacío: al menos un campo debe venir para actualizar
  if (!hayCambios) {
    throw new ErrorValidacion("Debe proporcionar al menos un campo para actualizar");
  }

  datosActualizados.actualizadoEn = new Date().toISOString();

  await docRef.update(datosActualizados);
  return { id, ...datosActuales, ...datosActualizados };
}

// Eliminar un plan por ID
export async function eliminarPlan(id, dbInyectado = db) {
  const docRef = dbInyectado.collection(COLECCION_PLANES).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new ErrorNoEncontrado("Plan no encontrado");
  }

  await docRef.delete();
  return { mensaje: "Plan eliminado correctamente" };
}
