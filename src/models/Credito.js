// Entidad: Credito
export class Credito {
  constructor({ id, alumnoId, cantidad, tipo, fecha, motivo }) {
    this.id = id;
    this.alumnoId = alumnoId;
    this.cantidad = cantidad;
    this.tipo = tipo; // debito, credito
    this.fecha = fecha;
    this.motivo = motivo;
  }
}
