// Caso de uso: Generar grilla de 3 meses
// Crea ocurrencias de clases recurrentes para todas las sucursales.

export class GenerarGrilla {
  constructor({ claseRepo, sucursalRepo, profesorRepo }) {
    this.claseRepo = claseRepo;
    this.sucursalRepo = sucursalRepo;
    this.profesorRepo = profesorRepo;
  }

  async ejecutar({ meses = 3 }) {
    const sucursales = await this.sucursalRepo.listarTodas();
    const clasesRecurrentes = await this.claseRepo.obtenerRecurrentes();

    const creadas = [];
    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() + meses);

    for (const sucursal of sucursales) {
      for (const claseRecurrente de clasesRecurrentes) {
        // Generar ocurrencias respetando feriados y excepciones
        const ocurrencias = await this.claseRepo.generarOcurrencias({
          claseRecurrente,
          sucursalId: sucursal.id,
          desde: hoy,
          hasta: fechaLimite,
        });
        creadas.push(...ocurrencias);
      }
    }

    return { total: creadas.length };
  }
}
