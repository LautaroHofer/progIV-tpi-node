import * as sucursalServicio from '../services/sucursalServicio.js';

export async function crearSucursal(req, res, next) {
  try {
    const sucursal = await sucursalServicio.crearSucursal(req.body);
    res.status(201).json(sucursal);
  } catch (error) {
    next(error);
  }
}

export async function listarSucursales(req, res, next) {
  try {
    const sucursales = await sucursalServicio.listarSucursales();
    res.json(sucursales);
  } catch (error) {
    next(error);
  }
}

export async function obtenerSucursal(req, res, next) {
  try {
    const sucursal = await sucursalServicio.obtenerSucursalPorId(req.params.id);
    res.json(sucursal);
  } catch (error) {
    next(error);
  }
}

export async function actualizarSucursal(req, res, next) {
  try {
    const sucursal = await sucursalServicio.actualizarSucursal(req.params.id, req.body);
    res.json(sucursal);
  } catch (error) {
    next(error);
  }
}

export async function eliminarSucursal(req, res, next) {
  try {
    const resultado = await sucursalServicio.eliminarSucursal(req.params.id);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}
