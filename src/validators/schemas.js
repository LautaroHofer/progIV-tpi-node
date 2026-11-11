import Joi from 'joi';

/**
 * Esquemas de validación Joi para los recursos de la API.
 * Se usan desde src/middlewares/validacion.js para validar el cuerpo
 * de las peticiones antes de llegar a los controladores.
 */
export const schemas = {
  sucursal: Joi.object({
    nombre: Joi.string().min(1).max(100).required(),
    direccion: Joi.string().allow('', null).optional(),
  }),

  sala: Joi.object({
    sucursal_id: Joi.string().trim().required(),
    nombre: Joi.string().min(1).max(100).required(),
    capacidad: Joi.number().integer().min(1).required(),
  }),

  profesor: Joi.object({
    nombre: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().allow('', null).optional(),
  }),

  plan: Joi.object({
    nombre: Joi.string().min(1).max(100).required(),
    cantidad_clases: Joi.number().integer().min(1).required(),
    precio: Joi.number().min(0).required(),
    vigencia_meses: Joi.number().integer().min(1).required(),
  }),

  alumno: Joi.object({
    nombre: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
  }),

  credito: Joi.object({
    cantidad: Joi.number().integer().positive().required(),
    tipo: Joi.string().valid('credito', 'debito').required(),
    motivo: Joi.string().allow('', null).optional(),
  }),

  notificacion: Joi.object({
    alumno_id: Joi.string().trim().required(),
    tipo: Joi.string().min(1).max(50).required(),
    mensaje: Joi.string().min(1).required(),
  }),
};
