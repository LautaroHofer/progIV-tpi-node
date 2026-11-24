import express from 'express';
import { validarEsquema } from '../middlewares/validacion.js';
import { requiereAuth, requiereRol } from '../middlewares/auth.js';
import {
  obtenerCreditos,
  agregarCreditos,
  descontarCreditos,
  obtenerHistorial,
} from '../controllers/creditoControlador.js';

const router = express.Router();

// Consultar saldo y historial (abierto, para uso interno y alumno)
router.get('/:alumnoId', obtenerCreditos);

// Agregar creditos (solo admin y recepcionista)
router.post(
  '/:alumnoId/agregar',
  requiereAuth,
  requiereRol(['admin', 'recepcionista']),
  validarEsquema('creditoAgregar'),
  agregarCreditos
);

// Descontar creditos (solo admin y recepcionista, usado por Python al reservar)
router.post(
  '/:alumnoId/descontar',
  requiereAuth,
  requiereRol(['admin', 'recepcionista']),
  validarEsquema('creditoDescontar'),
  descontarCreditos
);

// Historial de movimientos (abierto)
router.get('/:alumnoId/historial', obtenerHistorial);

export default router;
