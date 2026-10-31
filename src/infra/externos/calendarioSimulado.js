// Adaptador simulado de exportación de agenda del profesor a calendario.
export class CalendarioSimulado {
  async exportarAgendaProfesor({ profesorId, desde, hasta }) {
    console.log(`[CALENDARIO] Exportando agenda del profesor ${profesorId} de ${desde} a ${hasta}`);
    return { exportado: true, eventos: [] };
  }
}
