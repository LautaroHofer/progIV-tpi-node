// Adaptador simulado de cobro de planes.
export class PagosSimulado {
  async cobrarPlan({ alumnoId, planId, monto }) {
    console.log(`[PAGO SIMULADO] Alumno ${alumnoId} compró plan ${planId} por $${monto}`);
    return { aprobado: true, transaccionId: 'sim-' + Date.now() };
  }
}
