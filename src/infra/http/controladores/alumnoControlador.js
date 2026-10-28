export async function crearAlumno(req, res) {
  res.status(201).json({ mensaje: 'Alumno creado (placeholder)' });
}

export async function listarAlumnos(req, res) {
  res.json([]);
}

export async function obtenerAlumno(req, res) {
  res.json({ id: req.params.id, nombre: 'Alumno ejemplo', creditos: 0 });
}

export async function actualizarAlumno(req, res) {
  res.json({ id: req.params.id, mensaje: 'Alumno actualizado (placeholder)' });
}

export async function eliminarAlumno(req, res) {
  res.json({ id: req.params.id, mensaje: 'Alumno eliminado (placeholder)' });
}
