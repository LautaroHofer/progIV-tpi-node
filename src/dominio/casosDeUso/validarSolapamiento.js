// Caso de uso: Validar solapamiento
// Verifica que un profesor o sala no tengan dos clases en el mismo horario.

export class ValidarSolapamiento {
  constructor({ claseRepo }) {
    this.claseRepo = claseRepo;
  }

  async ejecutar({ profesorId, salaId, fechaInicio, fechaFin, excluirClaseId = null }) {
    const solapamientoProfesor = await this.claseRepo.existeSolapamientoProfesor({
      profesorId,
      fechaInicio,
      fechaFin,
      excluirClaseId,
    });
    if (solapamientoProfesor) return { valido: false, motivo: 'Profesor ya tiene una clase en ese horario' };

    const solapamientoSala = await this.claseRepo.existeSolapamientoSala({
      salaId,
      fechaInicio,
      fechaFin,
      excluirClaseId,
    });
    if (solapamientoSala) return { valido: false, motivo: 'Sala ya tiene una clase en ese horario' };

    return { valido: true };
  }
}
