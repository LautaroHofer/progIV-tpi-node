import express from 'express';
import { validarEsquema } from '../middlewares/validacion.js';
import {
  enviarRecordatorio,
  avisarLugarDisponible,
} from '../controllers/notificacionControlador.js';

const router = express.Router();

router.post('/recordatorio', validarEsquema('notificacion'), enviarRecordatorio);
router.post(
  '/lugar-disponible',
  validarEsquema('notificacion'),
  avisarLugarDisponible,
);

export default router;
