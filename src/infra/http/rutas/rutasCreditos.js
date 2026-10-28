import express from 'express';
import {
  obtenerCreditos,
  agregarCredito,
  descontarCredito,
  historialCreditos,
} from '../controladores/creditoControlador.js';

const router = express.Router();

router.get('/:alumnoId', obtenerCreditos);
router.post('/:alumnoId/agregar', agregarCredito);
router.post('/:alumnoId/descontar', descontarCredito);
router.get('/:alumnoId/historial', historialCreditos);

export default router;
