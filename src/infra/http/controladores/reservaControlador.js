export async function crearReserva(req, res) {
  res.status(201).json({ mensaje: 'Reserva creada (placeholder)' });
}

export async function listarReservas(req, res) {
  res.json([]);
}

export async function obtenerReserva(req, res) {
  res.json({ id: req.params.id, estado: 'confirmada' });
}

export async function cancelarReserva(req, res) {
  res.json({ id: req.params.id, cancelada: true, creditoDevuelto: true });
}

export async function listarReservasAlumno(req, res) {
  res.json({ alumnoId: req.params.alumnoId, reservas: [] });
}
