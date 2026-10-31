// Caso de uso: Generar grilla de 3 meses
// - Crea ocurrencias de clases recurrentes para todas las sucursales.
// - Respeta feriados, excepciones y cambios de profesor.
// - Idempotente: no duplica ocurrencias ya creadas ni borra reservas existentes.

export class GenerarGrilla {
  constructor({ claseRepo, sucursalRepo, profesorRepo }) {
    this.claseRepo = claseRepo;
    this.sucursalRepo = sucursalRepo;
    this.profesorRepo = profesorRepo;
  }

  async ejecutar({ meses = 3 } = {}) {
    const sucursales = await this.sucursalRepo.listarTodas();
    const clasesRecurrentes = await this.claseRepo.obtenerRecurrentes();
    const feriados = await this.claseRepo.obtenerFeriados();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaLimite = new Date(hoy);
    fechaLimite.setMonth(fechaLimite.getMonth() + meses);

    let creadas = 0;
    let omitidas = 0;

    for (const sucursal of sucursales) {
      for (const claseRecurrente de clasesRecurrentes) {
        const ocurrencias = await this.claseRepo.generarOcurrencias({
          claseRecurrente,
          sucursalId: sucursal.id,
          desde: hoy,
          hasta: fechaLimite,
          feriados,
        });

        for (const ocurrencia of ocurrencias) {
          // Idempotencia: no duplicar ocurrencias ya creadas.
          const yaExiste = await this.claseRepo.existeOcurrencia({
            claseRecurrenteId: claseRecurrente.id,
            fechaInicio: ocurrencia.fechaInicio,
            sucursalId: sucursal.id,
          });
          if (yaExiste) {
            omitidas++;
            continue;
          }
          await this.claseRepo.crear(ocurrencia);
          creadas++;
        }
      }
    }

    return { creadas, omitidas };
  }
}
