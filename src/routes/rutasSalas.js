import express from 'express';
import {
  crearSala,
  listarSalas,
  obtenerSala,
  actualizarSala,
  eliminarSala,
} from '../controllers/salaControlador.js';

const router = express.Router();

router.post('/', crearSala);
router.get('/', listarSalas);
router.get('/:id', obtenerSala);
router.put('/:id', actualizarSala);
router.delete('/:id', eliminarSala);

export default router;
