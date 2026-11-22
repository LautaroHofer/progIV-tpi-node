import * as salaServicio from '../services/salaServicio.js';

export async function crearSala(req, res, next) {
  try {
    const { sucursalId, nombre, capacidad, equipamiento } = req.body;
    const sala = await salaServicio.crearSala({
      sucursalId,
      nombre,
      capacidad,
      equipamiento,
    });
    res.status(201).json(sala);
  } catch (error) {
    next(error);
  }
}

export async function listarSalas(req, res, next) {
  try {
    const { sucursalId } = req.query;
    const salas = await salaServicio.listarSalas(sucursalId);
    res.json(salas);
  } catch (error) {
    next(error);
  }
}

export async function obtenerSala(req, res, next) {
  try {
    const sala = await salaServicio.obtenerSalaPorId(req.params.id);
    res.json(sala);
  } catch (error) {
    next(error);
  }
}

export async function actualizarSala(req, res, next) {
  try {
    const { sucursalId, nombre, capacidad, equipamiento } = req.body;
    const sala = await salaServicio.actualizarSala(req.params.id, {
      sucursalId,
      nombre,
      capacidad,
      equipamiento,
    });
    res.json(sala);
  } catch (error) {
    next(error);
  }
}

export async function eliminarSala(req, res, next) {
  try {
    const resultado = await salaServicio.eliminarSala(req.params.id);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}
