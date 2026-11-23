import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/conexion.js';
import { config } from '../config/env.js';
import { ErrorConflicto, ErrorNoAutorizado } from '../middlewares/errores.js';

const COLECCION_USUARIOS = 'usuarios';
export const COSTO_BCRYPT = 10;

// Registrar un usuario nuevo guardando la contraseña hasheada con bcryptjs
export async function registrarUsuario({ nombre, email, password, rol = 'alumno' }) {
  const emailNormalizado = email.toLowerCase().trim();

  const existente = await db
    .collection(COLECCION_USUARIOS)
    .where('email', '==', emailNormalizado)
    .limit(1)
    .get();

  if (!existente.empty) {
    throw new ErrorConflicto('Ya existe un usuario registrado con ese email');
  }

  const passwordHash = await bcrypt.hash(password, COSTO_BCRYPT);

  const nuevoUsuario = {
    nombre: nombre.trim(),
    email: emailNormalizado,
    rol,
    passwordHash,
    creadoEn: new Date().toISOString(),
  };

  const docRef = await db.collection(COLECCION_USUARIOS).add(nuevoUsuario);

  return {
    id: docRef.id,
    nombre: nuevoUsuario.nombre,
    email: nuevoUsuario.email,
    rol: nuevoUsuario.rol,
    creadoEn: nuevoUsuario.creadoEn,
  };
}

// Validar credenciales y devolver un token JWT HS256
export async function iniciarSesion({ email, password }) {
  const emailNormalizado = email.toLowerCase().trim();

  const snapshot = await db
    .collection(COLECCION_USUARIOS)
    .where('email', '==', emailNormalizado)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new ErrorNoAutorizado('Credenciales inválidas');
  }

  const doc = snapshot.docs[0];
  const usuario = doc.data();

  const coincide = await bcrypt.compare(password, usuario.passwordHash);
  if (!coincide) {
    throw new ErrorNoAutorizado('Credenciales inválidas');
  }

  const secret = process.env.JWT_SECRET || config.jwtSecret;
  const token = jwt.sign(
    { sub: doc.id, email: usuario.email, rol: usuario.rol },
    secret,
    { algorithm: 'HS256', expiresIn: '2h' }
  );

  return {
    token,
    usuario: {
      id: doc.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  };
}
