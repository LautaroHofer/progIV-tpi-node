import express from 'express';
import { validarEsquema } from '../middlewares/validacion.js';
import { requiereAuth, requiereRol } from '../middlewares/auth.js';
import {
  crearProfesor,
  listarProfesores,
  obtenerProfesor,
} from '../controllers/profesorControlador.js';

const router = express.Router();

router.post('/', requiereAuth, requiereRol(['admin']), validarEsquema('profesor'), crearProfesor);
router.get('/', listarProfesores);
router.get('/:id', obtenerProfesor);

export default router;
