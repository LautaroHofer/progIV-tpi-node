import express from 'express';
import { validarEsquema } from '../middlewares/validacion.js';
import {
  crearSucursal,
  listarSucursales,
  obtenerSucursal,
} from '../controllers/sucursalControlador.js';

const router = express.Router();

router.post('/', validarEsquema('sucursal'), crearSucursal);
router.get('/', listarSucursales);
router.get('/:id', obtenerSucursal);

export default router;
