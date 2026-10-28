import express from 'express';
import {
  crearSucursal,
  listarSucursales,
  obtenerSucursal,
} from '../controladores/sucursalControlador.js';

const router = express.Router();

router.post('/', crearSucursal);
router.get('/', listarSucursales);
router.get('/:id', obtenerSucursal);

export default router;