import * as creditoServicio from '../services/creditoServicio.js';

export async function obtenerSaldo(req, res, next) {
  try {
    const saldo = await creditoServicio.obtenerSaldo(req.params.alumnoId);
    res.json(saldo);
  } catch (error) {
    next(error);
  }
}

export async function obtenerHistorial(req, res, next) {
  try {
    const historial = await creditoServicio.obtenerHistorial(req.params.alumnoId);
    res.json(historial);
  } catch (error) {
    next(error);
  }
}

export async function agregarCreditos(req, res, next) {
  try {
    const { cantidad, motivo, fechaVencimiento } = req.body;
    const resultado = await creditoServicio.agregarCreditos({
      alumnoId: req.params.alumnoId,
      cantidad,
      motivo,
      fechaVencimiento,
      idempotencyKey: req.headers['idempotency-key'],
    });
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
}

export async function descontarCreditos(req, res, next) {
  try {
    const { cantidad, motivo } = req.body;
    const resultado = await creditoServicio.descontarCreditos({
      alumnoId: req.params.alumnoId,
      cantidad,
      motivo,
      idempotencyKey: req.headers['idempotency-key'],
    });
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

export async function devolverCreditos(req, res, next) {
  try {
    const { cantidad, motivo, fechaVencimiento } = req.body;
    const resultado = await creditoServicio.devolverCreditos({
      alumnoId: req.params.alumnoId,
      cantidad,
      motivo,
      fechaVencimiento,
      idempotencyKey: req.headers['idempotency-key'],
    });
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}
