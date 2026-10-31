// Adaptador simulado de notificaciones (recordatorio de clase, lugar disponible en lista de espera).
export class NotificadorSimulado {
  async enviarRecordatorio({ alumnoId, claseId, fecha }) {
    console.log(`[NOTIFICACIÓN] Recordatorio a alumno ${alumnoId} para clase ${claseId} en ${fecha}`);
    return { enviado: true };
  }

  async enviarLugarDisponible({ alumnoId, claseId, expiresAt }) {
    console.log(`[NOTIFICACIÓN] Lugar disponible para alumno ${alumnoId} en clase ${claseId}, expira ${expiresAt}`);
    return { enviado: true };
  }
}
