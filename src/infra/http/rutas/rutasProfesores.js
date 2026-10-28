import express from 'express';
import {
  crearProfesor,
  listarProfesores,
  obtenerProfesor,
  actualizarProfesor,
  eliminarProfesor,
  obtenerAgenda,
} from '../controladores/profesorControlador.js';

const router = express.Router();

router.post('/', crearProfesor);
router.get('/', listarProfesores);
router.get('/:id', obtenerProfesor);
router.put('/:id', actualizarProfesor);
router.delete('/:id', eliminarProfesor);
router.get('/:id/agenda', obtenerAgenda);

export default router;
