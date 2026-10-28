import express from 'express';
import {
  crearReserva,
  listarReservas,
  obtenerReserva,
  cancelarReserva,
  listarReservasAlumno,
} from '../controladores/reservaControlador.js';

const router = express.Router();

router.post('/', crearReserva);
router.get('/', listarReservas);
router.get('/:id', obtenerReserva);
router.post('/:id/cancelar', cancelarReserva);
router.get('/alumno/:alumnoId', listarReservasAlumno);

export default router;
