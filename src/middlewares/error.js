import { ErrorApp } from './errores.js';
import { logger, obtenerCorrelationId } from './logger.js';

// Middleware centralizado de errores.
// Traduce errores propios a códigos HTTP, agrega correlationId y nunca expone stack traces.
export function manejadorErrores(err, req, res, next) {
  const correlationId = obtenerCorrelationId();

  if (err instanceof ErrorApp) {
    return res.status(err.statusCode).json({
      error: err.message,
      codigo: err.codigo,
      correlationId,
    });
  }

  // Compatibilidad con errores que todavía traen statusCode manual
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      error: err.message,
      correlationId,
    });
  }

  logger.error('Error inesperado en el servidor', {
    detalle: err.message,
  });

  return res.status(500).json({
    error: 'Error interno del servidor',
    codigo: 'ERROR_INTERNO',
    correlationId,
  });
}
