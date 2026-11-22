import express from 'express';
import { requiereAuth, requiereRol } from '../middlewares/auth.js';
import { validarEsquema } from '../middlewares/validacion.js';
import {
  crearSucursal,
  listarSucursales,
  obtenerSucursal,
  actualizarSucursal,
  eliminarSucursal,
} from '../controllers/sucursalControlador.js';

const router = express.Router();

router.get('/', listarSucursales);
router.get('/:id', obtenerSucursal);
router.post('/', requiereAuth, requiereRol(['admin']), validarEsquema('sucursal'), crearSucursal);
router.put('/:id', requiereAuth, requiereRol(['admin']), validarEsquema('sucursal'), actualizarSucursal);
router.delete('/:id', requiereAuth, requiereRol(['admin']), eliminarSucursal);

export default router;
