// Adaptador simulado de notificaciones para enviar avisos a los alumnos.

export class NotificadorConsola {
  async enviarRecordatorio(alumno, clase) {
    console.log(`[Notificación] Recordatorio enviado a ${alumno?.email} para la clase ${clase?.id}`);
    return { enviado: true };
  }

  async avisarLugarDisponible(alumno, clase) {
    console.log(`[Notificación] Lugar disponible avisado a ${alumno?.email} para la clase ${clase?.id}`);
    return { enviado: true };
  }
}
