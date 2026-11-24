import * as creditoServicio from '../services/creditoServicio.js';

export async function obtenerCreditos(req, res, next) {
  try {
    const creditos = await creditoServicio.obtenerCreditos(req.params.alumnoId);
    res.json(creditos);
  } catch (error) {
    next(error);
  }
}

export async function agregarCreditos(req, res, next) {
  try {
    const { cantidad, motivo } = req.body;
    const credito = await creditoServicio.agregarCreditos(req.params.alumnoId, {
      cantidad,
      motivo,
    });
    res.status(201).json(credito);
  } catch (error) {
    next(error);
  }
}

export async function descontarCreditos(req, res, next) {
  try {
    const { cantidad, motivo } = req.body;
    const credito = await creditoServicio.descontarCreditos(req.params.alumnoId, {
      cantidad,
      motivo,
    });
    res.status(201).json(credito);
  } catch (error) {
    next(error);
  }
}

export async function obtenerHistorial(req, res, next) {
  try {
    const creditos = await creditoServicio.obtenerCreditos(req.params.alumnoId);
    res.json(creditos);
  } catch (error) {
    next(error);
  }
}
