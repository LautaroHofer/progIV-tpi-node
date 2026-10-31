import { obtenerDb } from '../conexion.js';

export class RepositorioListaEsperaFirebase {
  constructor() {
    this.coleccion = obtenerDb().collection('listaEspera');
  }

  async insertar({ claseId, alumnoId, posicion }) {
    const ref = await this.coleccion.add({ claseId, alumnoId, posicion, creadaEn: new Date() });
    return { id: ref.id, claseId, alumnoId, posicion };
  }

  async listarPorClaseOrdenado(claseId) {
    const snap = await this.coleccion
      .where('claseId', '==', claseId)
      .orderBy('posicion')
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async obtenerPrimero(claseId) {
    const snap = await this.coleccion
      .where('claseId', '==', claseId)
      .orderBy('posicion')
      .limit(1)
      .get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  }

  async remover(id) {
    await this.coleccion.doc(id).delete();
  }
}
