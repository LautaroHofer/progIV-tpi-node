export async function crearPlan(req, res) {
  res.status(201).json({ mensaje: 'Plan creado (placeholder)' });
}

export async function listarPlanes(req, res) {
  res.json([]);
}

export async function obtenerPlan(req, res) {
  res.json({ id: req.params.id, nombre: 'Plan ejemplo', cantidadClases: 8 });
}

export async function actualizarPlan(req, res) {
  res.json({ id: req.params.id, mensaje: 'Plan actualizado (placeholder)' });
}

export async function eliminarPlan(req, res) {
  res.json({ id: req.params.id, mensaje: 'Plan eliminado (placeholder)' });
}
