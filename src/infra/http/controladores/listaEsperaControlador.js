export async function unirseListaEspera(req, res) {
  res.status(201).json({ mensaje: 'Unido a lista de espera (placeholder)' });
}

export async function listarListaEspera(req, res) {
  res.json({ claseId: req.params.claseId, lista: [] });
}

export async function confirmarLugar(req, res) {
  res.json({ id: req.params.id, confirmado: true });
}
