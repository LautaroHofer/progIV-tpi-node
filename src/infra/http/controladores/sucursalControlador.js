export async function crearSucursal(req, res) {
  res.status(201).json({ mensaje: 'Sucursal creada (placeholder)' });
}

export async function listarSucursales(req, res) {
  res.json([]);
}

export async function obtenerSucursal(req, res) {
  res.json({ id: req.params.id, nombre: 'Sucursal ejemplo' });
}