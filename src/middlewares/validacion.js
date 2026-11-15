import Joi from 'joi';
import { schemas } from '../validators/schemas.js';

/**
 * Middleware de validación de entrada con Joi.
 * Valida el cuerpo de la petición (req.body) contra el esquema indicado.
 * Si falla, responde 400 con los detalles de error. Si pasa, limpia
 * req.body con el valor validado y pasa al siguiente middleware.
 */
export function validarEsquema(nombreEsquema) {
  return (req, res, next) => {
    const esquema = schemas[nombreEsquema];
    if (!esquema) {
      return res.status(500).json({
        error: 'Error interno',
        detalle: `Esquema de validación no configurado: ${nombreEsquema}`,
      });
    }

    const { error, value } = esquema.validate(req.body, {
      abortEarly: false,
      stripUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: error.details.map((d) => d.message),
      });
    }

    req.body = value;
    next();
  };
}
