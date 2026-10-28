// Caso de uso: Reservar turno
// Lógica de negocio para crear una reserva, validar cupo y descontar crédito.

export class ReservarTurno {
  constructor({ reservaRepo, claseRepo, alumnoRepo, creditoRepo }) {
    this.reservaRepo = reservaRepo;
    this.claseRepo = claseRepo;
    this.alumnoRepo = alumnoRepo;
    this.creditoRepo = creditoRepo;
  }

  async ejecutar({ alumnoId, claseId }) {
    const clase = await this.claseRepo.obtenerPorId(claseId);
    if (!clase) throw new Error('Clase no encontrada');

    const cupoDisponible = await this.claseRepo.cupoDisponible(claseId);
    if (cupoDisponible <= 0) throw new Error('No hay cupo disponible');

    const alumno = await this.alumnoRepo.obtenerPorId(alumnoId);
    if (!alumno) throw new Error('Alumno no encontrado');
    if (alumno.creditos < 1) throw new Error('Sin créditos suficientes');

    // Validar solapamiento de profesor y sala
    const solapamiento = await this.claseRepo.existeSolapamiento(claseId, alumnoId);
    if (solapamiento) throw new Error('El profesor o la sala ya tienen una clase en ese horario');

    const reserva = await this.reservaRepo.crear({ alumnoId, claseId, estado: 'confirmada' });

    // Descontar crédito
    await this.alumnoRepo.descontarCredito(alumnoId);
    await this.creditoRepo.registrar({
      alumnoId,
      cantidad: -1,
      tipo: 'debito',
      motivo: 'Reserva de turno',
    });

    return reserva;
  }
}
