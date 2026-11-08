import express from 'express';
import {
  enviarRecordatorio,
  avisarLugarDisponible,
} from '../controllers/notificacionControlador.js';

const router = express.Router();

router.post('/recordatorio', enviarRecordatorio);
router.post('/lugar-disponible', avisarLugarDisponible);

export default router;
