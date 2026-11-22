import express from 'express';
import { requiereAuth, requiereRol } from '../middlewares/auth.js';
import { validarEsquema } from '../middlewares/validacion.js';
import {
  crearSala,
  listarSalas,
  obtenerSala,
  actualizarSala,
  eliminarSala,
} from '../controllers/salaControlador.js';

const router = express.Router();

router.get('/', listarSalas);
router.get('/:id', obtenerSala);
router.post('/', requiereAuth, requiereRol(['admin']), validarEsquema('sala'), crearSala);
router.put('/:id', requiereAuth, requiereRol(['admin']), validarEsquema('sala'), actualizarSala);
router.delete('/:id', requiereAuth, requiereRol(['admin']), eliminarSala);

export default router;
