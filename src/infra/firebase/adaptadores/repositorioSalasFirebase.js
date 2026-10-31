import { obtenerDb } from '../conexion.js';

export class RepositorioSalasFirebase {
  constructor() {
    this.coleccion = obtenerDb().collection('salas');
  }

  async obtenerPorId(id) {
    const doc = await this.coleccion.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async listarPorSucursal(sucursalId) {
    const snap = await this.coleccion.where('sucursalId', '==', sucursalId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}
