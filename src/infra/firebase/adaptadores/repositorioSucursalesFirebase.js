import { obtenerDb } from '../conexion.js';

export class RepositorioSucursalesFirebase {
  constructor() {
    this.coleccion = obtenerDb().collection('sucursales');
  }

  async listarTodas() {
    const snap = await this.coleccion.get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async obtenerPorId(id) {
    const doc = await this.coleccion.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async crear(data) {
    const ref = await this.coleccion.add(data);
    return { id: ref.id, ...data };
  }
}
