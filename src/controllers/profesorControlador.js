import * as profesorServicio from '../services/profesorServicio.js';
import { db } from '../db/conexion.js';

export async function crearProfesor(req, res, next) {
  try {
    const { nombre, email } = req.body;
    const profesor = await profesorServicio.crearProfesor({ nombre, email }, db);
    res.status(201).json(profesor);
  } catch (error) {
    next(error);
  }
}

export async function listarProfesores(req, res, next) {
  try {
    const profesores = await profesorServicio.listarProfesores(db);
    res.json(profesores);
  } catch (error) {
    next(error);
  }
}

export async function obtenerProfesor(req, res, next) {
  try {
    const profesor = await profesorServicio.obtenerProfesorPorId(req.params.id, db);
    res.json(profesor);
  } catch (error) {
    next(error);
  }
}
