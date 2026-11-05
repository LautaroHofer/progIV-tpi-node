// Lectura y validación de variables de entorno al arrancar (Bloque 3).
import dotenv from 'dotenv';

dotenv.config();

export function validarVariablesEntorno() {
  const requeridas = ['PORT', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
  const faltantes = requeridas.filter((clave) => !process.env[clave]);

  if (faltantes.length > 0) {
    console.error(`Error: Faltan variables de entorno obligatorias: ${faltantes.join(', ')}`);
    process.exit(1);
  }
}

export const config = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  jwtSecret: process.env.JWT_SECRET,
};
