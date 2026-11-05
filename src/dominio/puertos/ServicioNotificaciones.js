// Puerto: Servicio de Notificaciones
// Interfaz del dominio para enviar recordatorios y avisos de lista de espera.

export class ServicioNotificaciones {
  async enviarRecordatorio(alumno, clase) {
    throw new Error('Método enviarRecordatorio() no implementado');
  }

  async avisarLugarDisponible(alumno, clase) {
    throw new Error('Método avisarLugarDisponible() no implementado');
  }
}
