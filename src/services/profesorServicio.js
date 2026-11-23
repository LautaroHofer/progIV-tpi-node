import { ErrorConflicto, ErrorNoEncontrado } from "../middlewares/errores.js";

const COLECCION_PROFESORES = "profesores";

// Crear un nuevo profesor, validación de unicidad de email
export async function crearProfesor({ nombre, email }, db) {
  const emailNormalizado = email.toLowerCase().trim();

  // verificar que el email no se repita
  const existente = await db
    .collection(COLECCION_PROFESORES)
    .where("email", "==", emailNormalizado)
    .limit(1)
    .get();

  if (!existente.empty) {
    throw new ErrorConflicto("Ya existe un profesor registrado con ese email");
  }

  const nuevoProfesor = {
    nombre: nombre.trim(),
    email: emailNormalizado,
    creadoEn: new Date().toISOString(),
  };

  const docRef = await db.collection(COLECCION_PROFESORES).add(nuevoProfesor);
  return { id: docRef.id, ...nuevoProfesor };
}

// Listar profesores en bbdd
export async function listarProfesores(db) {
  const snapshot = await db.collection(COLECCION_PROFESORES).get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Obtener un profesor por ID
export async function obtenerProfesorPorId(id, db) {
  const doc = await db.collection(COLECCION_PROFESORES).doc(id).get();
  if (!doc.exists) {
    throw new ErrorNoEncontrado("Profesor no encontrado");
  }
  return { id: doc.id, ...doc.data() };
}
