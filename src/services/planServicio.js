import { db } from "../db/conexion.js";

const COLECCION_PLANES = "planes";

// Crear un nuevo plan
export async function crearPlan({ nombre, cantidadClases, precio, vigenciaMeses }) {
  const nombreLimpio = nombre.trim();

  // verificar que no exista otro plan con el mismo nombre
  const existente = await db
    .collection(COLECCION_PLANES)
    .where("nombre", "==", nombreLimpio)
    .limit(1)
    .get();

  if (!existente.empty) {
    const error = new Error("Ya existe un plan registrado con ese nombre");
    error.statusCode = 409;
    throw error;
  }

  const nuevoPlan = {
    nombre: nombreLimpio,
    cantidadClases: Number(cantidadClases),
    precio: Number(precio),
    vigenciaMeses: Number(vigenciaMeses),
    creadoEn: new Date().toISOString(),
  };

  const docRef = await db.collection(COLECCION_PLANES).add(nuevoPlan);
  return { id: docRef.id, ...nuevoPlan };
}

// Listar todos los planes
export async function listarPlanes() {
  const snapshot = await db.collection(COLECCION_PLANES).get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Obtener un plan por ID
export async function obtenerPlanPorId(id) {
  const doc = await db.collection(COLECCION_PLANES).doc(id).get();
  if (!doc.exists) {
    const error = new Error("Plan no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return { id: doc.id, ...doc.data() };
}

// Actualizar un plan existente
export async function actualizarPlan(id, { nombre, cantidadClases, precio, vigenciaMeses }) {
  const docRef = db.collection(COLECCION_PLANES).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    const error = new Error("Plan no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const nombreLimpio = nombre.trim();

  // si cambia el nombre, verificar que no esté ocupado por otro plan
  if (doc.data().nombre !== nombreLimpio) {
    const ocupado = await db
      .collection(COLECCION_PLANES)
      .where("nombre", "==", nombreLimpio)
      .limit(1)
      .get();

    if (!ocupado.empty && ocupado.docs[0].id !== id) {
      const error = new Error("El nombre ya está en uso por otro plan");
      error.statusCode = 409;
      throw error;
    }
  }

  const datosActualizados = {
    nombre: nombreLimpio,
    cantidadClases: Number(cantidadClases),
    precio: Number(precio),
    vigenciaMeses: Number(vigenciaMeses),
    actualizadoEn: new Date().toISOString(),
  };

  await docRef.update(datosActualizados);
  return { id, ...doc.data(), ...datosActualizados };
}

// Eliminar un plan por ID
export async function eliminarPlan(id) {
  const docRef = db.collection(COLECCION_PLANES).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    const error = new Error("Plan no encontrado");
    error.statusCode = 404;
    throw error;
  }

  await docRef.delete();
  return { mensaje: "Plan eliminado correctamente" };
}
