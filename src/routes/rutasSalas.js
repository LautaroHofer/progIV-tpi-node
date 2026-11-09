import express from 'express';
import { validarEsquema } from '../middlewares/validacion.js';
import {
  crearSala,
  listarSalas,
  obtenerSala,
  actualizarSala,
  eliminarSala,
} from '../controllers/salaControlador.js';

const router = express.Router();

router.post('/', validarEsquema('sala'), crearSala);
router.get('/', listarSalas);
router.get('/:id', obtenerSala);
router.put('/:id', validarEsquema('sala'), actualizarSala);
router.delete('/:id', eliminarSala);

export default router;
