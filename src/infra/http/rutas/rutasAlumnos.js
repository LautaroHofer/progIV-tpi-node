import express from 'express';
import {
  crearAlumno,
  listarAlumnos,
  obtenerAlumno,
  actualizarAlumno,
  eliminarAlumno,
} from '../controladores/alumnoControlador.js';

const router = express.Router();

router.post('/', crearAlumno);
router.get('/', listarAlumnos);
router.get('/:id', obtenerAlumno);
router.put('/:id', actualizarAlumno);
router.delete('/:id', eliminarAlumno);

export default router;
