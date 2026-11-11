// Lectura y validación de variables de entorno según ambiente (local, test, uat, prod)
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

const nodeEnv = process.env.NODE_ENV || 'development';

// 1. Cargar archivo específico de ambiente si existe (.env.uat, .env.production, .env.test)
const envFile = `.env.${nodeEnv}`;
const envPath = path.resolve(process.cwd(), envFile);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// 2. Cargar .env base como fallback
dotenv.config();

export function validarVariablesEntorno() {
  const requeridas = ['PORT', 'JWT_SECRET'];

  // En UAT o Producción exigimos project ID y algún método de credenciales
  if (['uat', 'production', 'prod'].includes(nodeEnv)) {
    requeridas.push('FIREBASE_PROJECT_ID');
    const tieneCredencial =
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!tieneCredencial) {
      console.error(
        `Error: En ambiente ${nodeEnv} se requiere FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_KEY o GOOGLE_APPLICATION_CREDENTIALS.`
      );
      process.exit(1);
    }
  }

  const faltantes = requeridas.filter((clave) => !process.env[clave]);
  if (faltantes.length > 0) {
    console.error(`Error: Faltan variables de entorno obligatorias: ${faltantes.join(', ')}`);
    process.exit(1);
  }
}

export const config = {
  env: nodeEnv,
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  pythonApiUrl: process.env.PYTHON_API_URL || 'http://localhost:8000',
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || (nodeEnv === 'test' ? 'demo-tp-prog4' : undefined),
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    emulatorHost: process.env.FIRESTORE_EMULATOR_HOST,
  },
};
