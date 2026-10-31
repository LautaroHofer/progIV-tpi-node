import { obtenerDb } from '../conexion.js';

export class RepositorioClasesFirebase {
  constructor() {
    this.coleccion = obtenerDb().collection('clases');
  }

  async obtenerPorId(id) {
    const doc = await this.coleccion.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async obtenerRecurrentes() {
    const snap = await this.coleccion.where('recurrente', '==', true).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async obtenerFeriados() {
    // Stub: en producción se lee de una colección de feriados.
    return [];
  }

  async generarOcurrencias({ claseRecurrente, sucursalId, desde, hasta, feriados }) {
    // Stub: se implementa la recurrencia semanal respetando feriados y zona horaria.
    return [];
  }

  async existeOcurrencia({ claseRecurrenteId, fechaInicio, sucursalId }) {
    const snap = await this.coleccion
      .where('claseRecurrenteId', '==', claseRecurrenteId)
      .where('fechaInicio', '==', fechaInicio)
      .where('sucursalId', '==', sucursalId)
      .limit(1)
      .get();
    return !snap.empty;
  }

  async crear(data) {
    const ref = await this.coleccion.add(data);
    return { id: ref.id, ...data };
  }

  async existeSolapamientoProfesor({ profesorId, fechaInicio, fechaFin, excluirClaseId }) {
    // Stub: validación de solapamiento de profesor.
    return false;
  }

  async existeSolapamientoSala({ salaId, fechaInicio, fechaFin, excluirClaseId }) {
    // Stub: validación de solapamiento de sala.
    return false;
  }
}
