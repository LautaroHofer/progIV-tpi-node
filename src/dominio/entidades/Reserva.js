// Entidad: Reserva
export class Reserva {
  constructor({ id, alumnoId, claseId, estado, fechaReserva, creditoDescontado }) {
    this.id = id;
    this.alumnoId = alumnoId;
    this.claseId = claseId;
    this.estado = estado; // confirmada, cancelada, lista_espera
    this.fechaReserva = fechaReserva;
    this.creditoDescontado = creditoDescontado || false;
  }
}
