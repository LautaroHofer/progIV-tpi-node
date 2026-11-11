import express from 'express';
import { validarEsquema } from '../middlewares/validacion.js';
import {
  crearAlumno,
  listarAlumnos,
  obtenerAlumno,
  actualizarAlumno,
  eliminarAlumno,
} from '../controllers/alumnoControlador.js';

const router = express.Router();

router.post('/', validarEsquema('alumno'), crearAlumno);
router.get('/', listarAlumnos);
router.get('/:id', obtenerAlumno);
router.put('/:id', validarEsquema('alumno'), actualizarAlumno);
router.delete('/:id', eliminarAlumno);

export default router;
