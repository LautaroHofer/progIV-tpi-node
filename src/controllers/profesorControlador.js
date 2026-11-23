import * as profesorServicio from '../services/profesorServicio.js';

export async function crearProfesor(req, res, next) {
  try {
    const { nombre, email } = req.body;
    const profesor = await profesorServicio.crearProfesor({ nombre, email });
    res.status(201).json(profesor);
  } catch (error) {
    next(error);
  }
}

export async function listarProfesores(req, res, next) {
  try {
    const profesores = await profesorServicio.listarProfesores();
    res.json(profesores);
  } catch (error) {
    next(error);
  }
}

export async function obtenerProfesor(req, res, next) {
  try {
    const profesor = await profesorServicio.obtenerProfesorPorId(req.params.id);
    res.json(profesor);
  } catch (error) {
    next(error);
  }
}
