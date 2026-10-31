import { obtenerDb } from '../conexion.js';

export class RepositorioCreditosFirebase {
  constructor() {
    this.coleccion = obtenerDb().collection('creditos');
  }

  async registrar({ alumnoId, cantidad, tipo, motivo }) {
    await this.coleccion.add({ alumnoId, cantidad, tipo, motivo, fecha: new Date() });
  }
}
