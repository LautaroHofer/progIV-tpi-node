// Caso de uso: Actualizar créditos
// Gestiona el saldo de créditos del alumno.

export class ActualizarCreditos {
  constructor({ alumnoRepo, creditoRepo }) {
    this.alumnoRepo = alumnoRepo;
    this.creditoRepo = creditoRepo;
  }

  async ejecutar({ alumnoId, cantidad, tipo, motivo }) {
    const alumno = await this.alumnoRepo.obtenerPorId(alumnoId);
    if (!alumno) throw new Error('Alumno no encontrado');

    const nuevoSaldo = tipo === 'credito'
      ? alumno.creditos + cantidad
      : alumno.creditos - cantidad;

    if (nuevoSaldo < 0) throw new Error('Saldo insuficiente');

    await this.alumnoRepo.actualizarCreditos(alumnoId, nuevoSaldo);
    await this.creditoRepo.registrar({ alumnoId, cantidad, tipo, motivo });

    return { alumnoId, saldoAnterior: alumno.creditos, saldoNuevo: nuevoSaldo };
  }
}
