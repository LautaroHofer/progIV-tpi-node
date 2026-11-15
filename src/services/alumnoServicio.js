import { db } from "../db/conexion.js";

const COLECCION_ALUMNOS = "alumnos";

// creacion de usuario alumno, validacion de unicidad de email e inicializacion de creditos en 0
export async function crearAlumno({ nombre, email }) {
  const emailNormalizado = email.toLowerCase().trim();

  // verificar que el email no se repita
  const existente = await db
    .collection(COLECCION_ALUMNOS)
    .where("email", "==", emailNormalizado)
    .limit(1)
    .get();

  if (!existente.empty) {
    const error = new Error("Ya existe un alumno registrado con ese email");
    error.statusCode = 409;
    throw error;
  }

  const nuevoAlumno = {
    nombre: nombre.trim(),
    email: emailNormalizado,
    creditos: 0,
    creadoEn: new Date().toISOString(),
  };

  const docRef = await db.collection(COLECCION_ALUMNOS).add(nuevoAlumno);
  return { id: docRef.id, ...nuevoAlumno };
}

// Listar alumnos en bbdd
export async function listarAlumnos() {
  const snapshot = await db.collection(COLECCION_ALUMNOS).get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// get alumno por ID
export async function obtenerAlumnoPorId(id) {
  const doc = await db.collection(COLECCION_ALUMNOS).doc(id).get();
  if (!doc.exists) {
    const error = new Error("Alumno no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return { id: doc.id, ...doc.data() };
}

// actualizar datos de alumno existente (nombre, email -- se valida que no exista otro igual)
export async function actualizarAlumno(id, { nombre, email }) {
  const docRef = db.collection(COLECCION_ALUMNOS).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    const error = new Error("Alumno no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const emailNormalizado = email.toLowerCase().trim();

  // si cambia el email, verificar que no esté ocupado por otro alumno
  if (doc.data().email !== emailNormalizado) {
    const ocupado = await db
      .collection(COLECCION_ALUMNOS)
      .where("email", "==", emailNormalizado)
      .limit(1)
      .get();

    if (!ocupado.empty && ocupado.docs[0].id !== id) {
      const error = new Error("El nuevo email ya está en uso por otro alumno");
      error.statusCode = 409;
      throw error;
    }
  }

  const datosActualizados = {
    nombre: nombre.trim(),
    email: emailNormalizado,
    actualizadoEn: new Date().toISOString(),
  };

  await docRef.update(datosActualizados);
  return { id, ...doc.data(), ...datosActualizados };
}

// eliminacion de alumno por ID
export async function eliminarAlumno(id) {
  const docRef = db.collection(COLECCION_ALUMNOS).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    const error = new Error("Alumno no encontrado");
    error.statusCode = 404;
    throw error;
  }

  await docRef.delete();
  return { mensaje: "Alumno eliminado correctamente" };
}
