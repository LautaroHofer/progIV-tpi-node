import express from 'express';
import { requiereAuth, requiereRol, requierePropietarioORol } from '../middlewares/auth.js';
import { validarEsquema } from '../middlewares/validacion.js';
import {
  obtenerSaldo,
  obtenerHistorial,
  agregarCreditos,
  descontarCreditos,
  devolverCreditos,
} from '../controllers/creditoControlador.js';

const router = express.Router();

router.get('/:alumnoId', requiereAuth, requierePropietarioORol('alumnoId'), obtenerSaldo);
router.get('/:alumnoId/historial', requiereAuth, requierePropietarioORol('alumnoId'), obtenerHistorial);
router.post('/:alumnoId/agregar', requiereAuth, requiereRol(['admin', 'recepcionista']), validarEsquema('creditoAgregar'), agregarCreditos);
router.post('/:alumnoId/descontar', requiereAuth, requiereRol(['admin', 'recepcionista', 'alumno']), requierePropietarioORol('alumnoId'), validarEsquema('creditoDescontar'), descontarCreditos);
router.post('/:alumnoId/devolver', requiereAuth, requiereRol(['admin', 'recepcionista', 'alumno']), requierePropietarioORol('alumnoId'), validarEsquema('creditoDevolver'), devolverCreditos);

export default router;
