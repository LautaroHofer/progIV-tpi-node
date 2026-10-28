import express from 'express';
import {
  crearPlan,
  listarPlanes,
  obtenerPlan,
  actualizarPlan,
  eliminarPlan,
} from '../controladores/planControlador.js';

const router = express.Router();

router.post('/', crearPlan);
router.get('/', listarPlanes);
router.get('/:id', obtenerPlan);
router.put('/:id', actualizarPlan);
router.delete('/:id', eliminarPlan);

export default router;
