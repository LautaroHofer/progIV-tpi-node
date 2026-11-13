import * as alumnoServicio from '../services/alumnoServicio.js';

export async function crearAlumno(req, res, next) {
  try {
    const { nombre, email } = req.body;
    const alumno = await alumnoServicio.crearAlumno({ nombre, email });
    res.status(201).json(alumno);
  } catch (error) {
    next(error);
  }
}

export async function listarAlumnos(req, res, next) {
  try {
    const alumnos = await alumnoServicio.listarAlumnos();
    res.json(alumnos);
  } catch (error) {
    next(error);
  }
}

export async function obtenerAlumno(req, res, next) {
  try {
    const alumno = await alumnoServicio.obtenerAlumnoPorId(req.params.id);
    res.json(alumno);
  } catch (error) {
    next(error);
  }
}

export async function actualizarAlumno(req, res, next) {
  try {
    const { nombre, email } = req.body;
    const alumno = await alumnoServicio.actualizarAlumno(req.params.id, {
      nombre,
      email,
    });
    res.json(alumno);
  } catch (error) {
    next(error);
  }
}

export async function eliminarAlumno(req, res, next) {
  try {
    const resultado = await alumnoServicio.eliminarAlumno(req.params.id);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}
