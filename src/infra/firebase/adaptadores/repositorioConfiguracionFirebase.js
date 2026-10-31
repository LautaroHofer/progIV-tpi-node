import { obtenerDb } from '../conexion.js';

export class RepositorioConfiguracionFirebase {
  constructor() {
    this.coleccion = obtenerDb().collection('configuracion');
  }

  async obtenerVentanaCancelacionHoras() {
    const doc = await this.coleccion.doc('ventana_cancelacion_horas').get();
    if (!doc.exists) return 4;
    return parseInt(doc.data().valor || '4', 10);
  }
}
