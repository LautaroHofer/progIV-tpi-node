import Joi from 'joi';

/**
 * Esquemas de validación Joi para los recursos de la API.
 * Se usan desde src/middlewares/validacion.js para validar el cuerpo
 * de las peticiones antes de llegar a los controladores.
 */
export const schemas = {
  alumno: Joi.object({
    nombre: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
  }),
  plan: Joi.object({
    nombre: Joi.string().min(1).max(100).required(),
    cantidadClases: Joi.number().integer().positive().required(),
    precio: Joi.number().positive().required(),
    vigenciaMeses: Joi.number().integer().positive().required(),
  }),
  planActualizar: Joi.object({
    nombre: Joi.string().min(1).max(100).optional(),
    cantidadClases: Joi.number().integer().positive().optional(),
    precio: Joi.number().positive().optional(),
    vigenciaMeses: Joi.number().integer().positive().optional(),
  }),
  sucursal: Joi.object({
    nombre: Joi.string().min(1).max(100).required(),
    direccion: Joi.string().min(1).max(200).required(),
    zonaHoraria: Joi.string().min(1).max(60).required(),
  }),

  sala: Joi.object({
    sucursalId: Joi.string().trim().min(1).required(),
    nombre: Joi.string().trim().min(1).max(100).required(),
    capacidad: Joi.number().integer().min(1).required(),
    equipamiento: Joi.string().trim().max(150).allow('').optional(),
  }),

  registro: Joi.object({
    nombre: Joi.string().trim().min(1).max(100).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).max(100).required(),
    rol: Joi.string().valid('admin', 'recepcionista', 'profesor', 'alumno').optional(),
  }),

  login: Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(1).max(100).required(),
  }),
};
