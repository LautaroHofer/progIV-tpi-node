import { obtenerDb } from '../conexion.js';

export class RepositorioAlumnosFirebase {
  constructor() {
    this.coleccion = obtenerDb().collection('alumnos');
  }

  async obtenerPorId(id) {
    const doc = await this.coleccion.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async descontarCredito(alumnoId) {
    // Stub: decrementa créditos del alumno.
  }

  async agregarCredito(alumnoId) {
    // Stub: incrementa créditos del alumno.
  }
}
