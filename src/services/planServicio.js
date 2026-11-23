import { db } from "../db/conexion.js";

const COLECCION_PLANES = "planes";

// Colecciones que podrían referenciar un plan (activar cuando esos módulos existan)
const COLECCIONES_CON_REFERENCIAS = ["alumnos", "creditos"];

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
    const error = new Error("Plan no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return { id: doc.id, ...doc.data() };
}

// Actualizar un plan existente (actualización parcial permitida)
export async function actualizarPlan(id, { nombre, cantidadClases, precio, vigenciaMeses }, dbInyectado = db) {
  const docRef = dbInyectado.collection(COLECCION_PLANES).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    const error = new Error("Plan no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const datosActuales = doc.data();
  const datosActualizados = {};
  let hayCambios = false;

  // Solo actualizar los campos que realmente vinieron en el request
  if (nombre !== undefined) {
    const nombreLimpio = nombre.trim();

    // si cambia el nombre, verificar que no esté ocupado por otro plan
    if (datosActuales.nombre !== nombreLimpio) {
      const ocupado = await dbInyectado
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
    const error = new Error("Debe proporcionar al menos un campo para actualizar");
    error.statusCode = 400;
    throw error;
  }

  datosActualizados.actualizadoEn = new Date().toISOString();

  await docRef.update(datosActualizados);
  return { id, ...datosActuales, ...datosActualizados };
}

// Verificar que el plan no tenga referencias activas antes de eliminarlo
async function verificarReferenciasPlan(id, dbInyectado) {
  // Por ahora no hay módulos que referencien planes (créditos, inscripciones, etc.).
  // Cuando se implementen, descomentar y ajustar las colecciones correspondientes.
  /*
  for (const coleccion of COLECCIONES_CON_REFERENCIAS) {
    const snap = await dbInyectado
      .collection(coleccion)
      .where("planId", "==", id)
      .limit(1)
      .get();
    if (!snap.empty) {
      const error = new Error(`No se puede eliminar: el plan está en uso por ${coleccion}`);
      error.statusCode = 409;
      throw error;
    }
  }
  */
}

// Eliminar un plan por ID
export async function eliminarPlan(id, dbInyectado = db) {
  const docRef = dbInyectado.collection(COLECCION_PLANES).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    const error = new Error("Plan no encontrado");
    error.statusCode = 404;
    throw error;
  }

  // Verificar que no haya referencias activas antes de eliminar
  await verificarReferenciasPlan(id, dbInyectado);

  await docRef.delete();
  return { mensaje: "Plan eliminado correctamente" };
}
