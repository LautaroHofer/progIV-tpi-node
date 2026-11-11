import express from 'express';
import { validarEsquema } from '../middlewares/validacion.js';
import {
  crearProfesor,
  listarProfesores,
  obtenerProfesor,
  actualizarProfesor,
  eliminarProfesor,
  obtenerAgenda,
} from '../controllers/profesorControlador.js';

const router = express.Router();

router.post('/', validarEsquema('profesor'), crearProfesor);
router.get('/', listarProfesores);
router.get('/:id', obtenerProfesor);
router.put('/:id', validarEsquema('profesor'), actualizarProfesor);
router.delete('/:id', eliminarProfesor);
router.get('/:id/agenda', obtenerAgenda);

export default router;
