import { obtenerDb } from '../conexion.js';

export class RepositorioReservasFirebase {
  constructor() {
    this.coleccion = obtenerDb().collection('reservas');
  }

  async obtenerPorId(id) {
    const doc = await this.coleccion.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async crearEnTransaccion({ alumnoId, claseId, cupo, estado }) {
    // Stub: acá iría db.runTransaction para leer reservas de la clase,
    // contar confirmadas y crear solo si hay cupo (evita sobreventa).
    const ref = await this.coleccion.add({ alumnoId, claseId, estado, cupo });
    return { id: ref.id, alumnoId, claseId, estado };
  }

  async actualizarEstado(id, estado) {
    await this.coleccion.doc(id).update({ estado });
  }

  async obtenerFechaClase(claseId) {
    // Stub: devuelve la fecha de inicio de la clase.
    return new Date();
  }

  async existeSolapamientoAlumno({ alumnoId, fechaInicio, fechaFin, excluirReservaId }) {
    // Stub: valida que el alumno no tenga otra reserva solapada.
    return false;
  }

  async listarPorAlumno(alumnoId) {
    const snap = await this.coleccion.where('alumnoId', '==', alumnoId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async listarPorClase(claseId) {
    const snap = await this.coleccion.where('claseId', '==', claseId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}
