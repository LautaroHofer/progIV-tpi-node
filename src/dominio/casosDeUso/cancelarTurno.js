// Caso de uso: Cancelar turno
// Devuelve el crédito si está dentro de la ventana permitida.

export class CancelarTurno {
  constructor({ reservaRepo, alumnoRepo, creditoRepo, configuracionRepo }) {
    this.reservaRepo = reservaRepo;
    this.alumnoRepo = alumnoRepo;
    this.creditoRepo = creditoRepo;
    this.configuracionRepo = configuracionRepo;
  }

  async ejecutar({ reservaId, alumnoId }) {
    const reserva = await this.reservaRepo.obtenerPorId(reservaId);
    if (!reserva) throw new Error('Reserva no encontrada');
    if (reserva.alumnoId !== alumnoId) throw new Error('No es titular de la reserva');
    if (reserva.estado !== 'confirmada') throw new Error('Solo se pueden cancelar reservas confirmadas');

    const ventanaHoras = await this.configuracionRepo.obtenerVentanaCancelacionHoras();
    const ahora = new Date();
    const fechaClase = await this.reservaRepo.obtenerFechaClase(reserva.claseId);
    const horasRestantes = (fechaClase - ahora) / (1000 * 60 * 60);

    let seDevuelveCredito = false;
    if (horasRestantes >= ventanaHoras) {
      await this.alumnoRepo.agregarCredito(alumnoId);
      await this.creditoRepo.registrar({
        alumnoId,
        cantidad: 1,
        tipo: 'credito',
        motivo: 'Cancelación dentro de ventana',
      });
      seDevuelveCredito = true;
    }

    await this.reservaRepo.actualizarEstado(reservaId, 'cancelada');

    return { cancelada: true, creditoDevuelto: seDevuelveCredito };
  }
}
