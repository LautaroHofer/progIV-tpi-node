export async function crearProfesor(req, res) {
  res.status(201).json({ mensaje: 'Profesor creado (placeholder)' });
}

export async function listarProfesores(req, res) {
  res.json([]);
}

export async function obtenerProfesor(req, res) {
  res.json({ id: req.params.id, nombre: 'Profesor ejemplo' });
}

export async function actualizarProfesor(req, res) {
  res.json({ id: req.params.id, mensaje: 'Profesor actualizado (placeholder)' });
}

export async function eliminarProfesor(req, res) {
  res.json({ id: req.params.id, mensaje: 'Profesor eliminado (placeholder)' });
}

export async function obtenerAgenda(req, res) {
  res.json({ profesorId: req.params.id, clases: [] });
}
