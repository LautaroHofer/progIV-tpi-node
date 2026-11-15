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
};
