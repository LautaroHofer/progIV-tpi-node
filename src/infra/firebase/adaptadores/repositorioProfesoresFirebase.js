import { obtenerDb } from '../conexion.js';

export class RepositorioProfesoresFirebase {
  constructor() {
    this.coleccion = obtenerDb().collection('profesores');
  }

  async obtenerPorId(id) {
    const doc = await this.coleccion.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
}
