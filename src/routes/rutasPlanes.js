import express from 'express';
import { validarEsquema } from '../middlewares/validacion.js';
import {
  crearPlan,
  listarPlanes,
  obtenerPlan,
  actualizarPlan,
  eliminarPlan,
} from '../controllers/planControlador.js';

const router = express.Router();

router.post('/', validarEsquema('plan'), crearPlan);
router.get('/', listarPlanes);
router.get('/:id', obtenerPlan);
router.put('/:id', validarEsquema('plan'), actualizarPlan);
router.delete('/:id', eliminarPlan);

export default router;
