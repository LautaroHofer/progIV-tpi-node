import { db } from "../db/conexion.js";
import { ErrorConflicto, ErrorNoEncontrado } from "../middlewares/errores.js";

const COLECCION_CREDITOS = "creditos";

// Obtener saldo y historial de creditos de un alumno
export async function obtenerCreditos(alumnoId) {
  const snapshot = await db
    .collection(COLECCION_CREDITOS)
    .where("alumnoId", "==", alumnoId)
    .orderBy("fecha", "desc")
    .get();

  const movimientos = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const saldo = movimientos.reduce((total, m) => {
    return m.tipo === "credito" ? total + m.cantidad : total - m.cantidad;
  }, 0);

  return { alumnoId, saldo, movimientos };
}

// Agregar creditos a un alumno (tipo "credito")
export async function agregarCreditos(alumnoId, { cantidad, motivo }) {
  const nuevoCredito = {
    alumnoId,
    cantidad: Number(cantidad),
    tipo: "credito",
    motivo: motivo.trim(),
    fecha: new Date().toISOString(),
  };

  const docRef = await db.collection(COLECCION_CREDITOS).add(nuevoCredito);
  return { id: docRef.id, ...nuevoCredito };
}

// Descontar creditos de un alumno (tipo "debito")
export async function descontarCreditos(alumnoId, { cantidad, motivo }) {
  const { saldo } = await obtenerCreditos(alumnoId);

  if (saldo < cantidad) {
    const error = new Error("Saldo insuficiente de creditos");
    error.statusCode = 409;
    throw error;
  }

  const nuevoCredito = {
    alumnoId,
    cantidad: Number(cantidad),
    tipo: "debito",
    motivo: motivo.trim(),
    fecha: new Date().toISOString(),
  };

  const docRef = await db.collection(COLECCION_CREDITOS).add(nuevoCredito);
  return { id: docRef.id, ...nuevoCredito };
}
