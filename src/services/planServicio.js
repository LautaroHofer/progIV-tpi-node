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
