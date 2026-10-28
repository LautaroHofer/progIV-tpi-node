export async function obtenerCreditos(req, res) {
  res.json({ alumnoId: req.params.alumnoId, creditos: 0 });
}

export async function agregarCredito(req, res) {
  res.json({ alumnoId: req.params.alumnoId, mensaje: 'Crédito agregado (placeholder)' });
}

export async function descontarCredito(req, res) {
  res.json({ alumnoId: req.params.alumnoId, mensaje: 'Crédito descontado (placeholder)' });
}

export async function historialCreditos(req, res) {
  res.json({ alumnoId: req.params.alumnoId, historial: [] });
}
