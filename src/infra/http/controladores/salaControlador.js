export async function crearSala(req, res) {
  res.status(201).json({ mensaje: 'Sala creada (placeholder)' });
}

export async function listarSalas(req, res) {
  res.json([]);
}

export async function obtenerSala(req, res) {
  res.json({ id: req.params.id, nombre: 'Sala ejemplo', capacidad: 6 });
}

export async function actualizarSala(req, res) {
  res.json({ id: req.params.id, mensaje: 'Sala actualizada (placeholder)' });
}

export async function eliminarSala(req, res) {
  res.json({ id: req.params.id, mensaje: 'Sala eliminada (placeholder)' });
}
