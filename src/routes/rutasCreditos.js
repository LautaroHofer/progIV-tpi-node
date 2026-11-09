import express from 'express';
import { validarEsquema } from '../middlewares/validacion.js';
import {
  obtenerCreditos,
  agregarCredito,
  descontarCredito,
  historialCreditos,
} from '../controllers/creditoControlador.js';

const router = express.Router();

router.get('/:alumnoId', obtenerCreditos);
router.post('/:alumnoId/agregar', validarEsquema('credito'), agregarCredito);
router.post('/:alumnoId/descontar', validarEsquema('credito'), descontarCredito);
router.get('/:alumnoId/historial', historialCreditos);

export default router;
