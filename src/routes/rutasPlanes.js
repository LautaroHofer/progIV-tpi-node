import express from 'express';
import { validarEsquema } from '../middlewares/validacion.js';
import { requiereAuth, requiereRol } from '../middlewares/auth.js';
import {
  crearPlan,
  listarPlanes,
  obtenerPlan,
} from '../controllers/planControlador.js';

const router = express.Router();

router.post('/', requiereAuth, requiereRol(['admin']), validarEsquema('plan'), crearPlan);
router.get('/', listarPlanes);
router.get('/:id', obtenerPlan);

export default router;
