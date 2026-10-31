// Caso de uso: Cancelar turno
// - Devuelve el crédito si está dentro de la ventana permitida.
// - Idempotente: dos cancelaciones de la misma reserva devuelven un solo crédito.
// - Fuera de ventana: el crédito se pierde y se registra la ausencia con motivo.

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

    // Idempotencia: si ya está cancelada, no se devuelve otro crédito.
    if (reserva.estado !== 'confirmada') {
      return {
        cancelada: true,
        creditoDevuelto: false,
        yaCancelada: true,
        motivo: `Reserva ya estaba ${reserva.estado}`,
      };
    }

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
    } else {
      // Fuera de ventana: el crédito se pierde y se registra la ausencia con motivo.
      await this.creditoRepo.registrar({
        alumnoId,
        cantidad: 0,
        tipo: 'ausencia',
        motivo: 'Cancelación fuera de ventana',
      });
    }

    await this.reservaRepo.actualizarEstado(reservaId, 'cancelada');

    return { cancelada: true, creditoDevuelto: seDevuelveCredito };
  }
}
