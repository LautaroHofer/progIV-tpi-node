// Caso de uso: Reservar turno
// - El cupo sale de la capacidad de la sala (equipamiento), nunca de un número a mano.
// - Usa transacción de Firestore para evitar sobreventa bajo concurrencia.
// - Valida solapamiento de alumno, profesor y sala antes de confirmar.

export class ReservarTurno {
  constructor({ reservaRepo, claseRepo, salaRepo, alumnoRepo, creditoRepo }) {
    this.reservaRepo = reservaRepo;
    this.claseRepo = claseRepo;
    this.salaRepo = salaRepo;
    this.alumnoRepo = alumnoRepo;
    this.creditoRepo = creditoRepo;
  }

  async ejecutar({ alumnoId, claseId }) {
    const clase = await this.claseRepo.obtenerPorId(claseId);
    if (!clase) throw new Error('Clase no encontrada');

    const sala = await this.salaRepo.obtenerPorId(clase.salaId);
    if (!sala) throw new Error('Sala no encontrada');

    // El cupo de la clase sale de la capacidad de la sala/equipamiento.
    const cupo = sala.capacidad;
    if (!cupo || cupo <= 0) throw new Error('La sala no tiene capacidad definida');

    const alumno = await this.alumnoRepo.obtenerPorId(alumnoId);
    if (!alumno) throw new Error('Alumno no encontrado');

    // Transacción de Firestore: lee reservas de la clase y crea de forma atómica.
    // Así nunca se sobrevende aunque 50 alumnos reserven al mismo segundo.
    const reserva = await this.reservaRepo.crearEnTransaccion({
      alumnoId,
      claseId,
      cupo,
      estado: 'confirmada',
    });

    if (!reserva) throw new Error('No hay cupo disponible');

    // Validar solapamiento del alumno (misma sucursal o distinta).
    const solapamientoAlumno = await this.reservaRepo.existeSolapamientoAlumno({
      alumnoId,
      fechaInicio: clase.fechaInicio,
      fechaFin: clase.fechaFin,
      excluirReservaId: reserva.id,
    });
    if (solapamientoAlumno) {
      await this.reservaRepo.actualizarEstado(reserva.id, 'rechazada');
      throw new Error(
        'El alumno ya tiene una reserva que se solapa en ese horario'
      );
    }

    // Validar solapamiento de profesor y sala.
    const solapamientoProfesor = await this.claseRepo.existeSolapamientoProfesor({
      profesorId: clase.profesorId,
      fechaInicio: clase.fechaInicio,
      fechaFin: clase.fechaFin,
      excluirClaseId: claseId,
    });
    if (solapamientoProfesor) {
      await this.reservaRepo.actualizarEstado(reserva.id, 'rechazada');
      throw new Error('El profesor ya tiene una clase que se solapa');
    }

    const solapamientoSala = await this.claseRepo.existeSolapamientoSala({
      salaId: clase.salaId,
      fechaInicio: clase.fechaInicio,
      fechaFin: clase.fechaFin,
      excluirClaseId: claseId,
    });
    if (solapamientoSala) {
      await this.reservaRepo.actualizarEstado(reserva.id, 'rechazada');
      throw new Error('La sala ya tiene una clase que se solapa');
    }

    // Descontar crédito solo si todo es válido.
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
