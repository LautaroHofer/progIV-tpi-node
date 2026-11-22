import { ErrorApp } from './errores.js';

// Middleware centralizado de errores.
// Traduce errores propios a códigos HTTP y evita exponer detalles internos o stack traces.
export function manejadorErrores(err, req, res, next) {
  if (err instanceof ErrorApp) {
    return res.status(err.statusCode).json({
      error: err.message,
      codigo: err.codigo,
    });
  }

  // Compatibilidad con errores que todavía traen statusCode manual
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  console.error('Error inesperado:', err);
  return res.status(500).json({
    error: 'Error interno del servidor',
    codigo: 'ERROR_INTERNO',
  });
}
