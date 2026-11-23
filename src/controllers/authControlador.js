import * as authServicio from '../services/authServicio.js';

export async function registrar(req, res, next) {
  try {
    const { nombre, email, password, rol } = req.body;
    const usuario = await authServicio.registrarUsuario({
      nombre,
      email,
      password,
      rol,
    });
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const resultado = await authServicio.iniciarSesion({ email, password });
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}
