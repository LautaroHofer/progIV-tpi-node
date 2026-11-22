import * as planServicio from '../services/planServicio.js';

export async function crearPlan(req, res, next) {
  try {
    const { nombre, cantidadClases, precio, vigenciaMeses } = req.body;
    const plan = await planServicio.crearPlan({ nombre, cantidadClases, precio, vigenciaMeses });
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
}

export async function listarPlanes(req, res, next) {
  try {
    const planes = await planServicio.listarPlanes();
    res.json(planes);
  } catch (error) {
    next(error);
  }
}

export async function obtenerPlan(req, res, next) {
  try {
    const plan = await planServicio.obtenerPlanPorId(req.params.id);
    res.json(plan);
  } catch (error) {
    next(error);
  }
}
