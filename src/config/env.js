// Lectura y validación de variables de entorno según ambiente (local, test, uat, prod)
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

// 1. Detectar ambiente por flags de línea de comando (--dev, --uat, --prod) o variable NODE_ENV
let nodeEnv = process.env.NODE_ENV || 'development';

if (process.argv.includes('--prod') || process.argv.includes('--production')) {
  nodeEnv = 'production';
} else if (process.argv.includes('--uat') || process.argv.includes('--staging')) {
  nodeEnv = 'uat';
} else if (process.argv.includes('--dev') || process.argv.includes('--development')) {
  nodeEnv = 'development';
} else if (process.argv.includes('--test')) {
  nodeEnv = 'test';
}

process.env.NODE_ENV = nodeEnv;

// 2. Cargar archivo específico de ambiente si existe (.env.uat, .env.production, .env.local, .env.test)
const envLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
}

const envFile = `.env.${nodeEnv}`;
const envPath = path.resolve(process.cwd(), envFile);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// 3. Cargar .env base como fallback
dotenv.config();

// 4. Mapeo automático de base de datos de Firestore según el ambiente
function resolverDatabaseId() {
  const customId =
    process.env.FB_DATABASE_ID ||
    process.env.FIRESTORE_DATABASE_ID ||
    process.env.FIREBASE_DATABASE_ID;

  if (customId) {
    return customId;
  }
  switch (nodeEnv) {
    case 'uat':
    case 'staging':
      return 'turnapp-uat';
    case 'production':
    case 'prod':
      return 'turnapp-prod';
    case 'development':
    case 'test':
    default:
      return '(default)';
  }
}

export function validarVariablesEntorno() {
  // Nota: PORT no se exige como obligatoria porque en Cloud Run / Cloud Functions
  // Google la inyecta dinámicamente y en local defaultea a 3000.
  const requeridas = ['JWT_SECRET'];

  // En UAT o Producción exigimos project ID y algún método de credenciales (si no corre en GCP)
  if (['uat', 'production', 'prod'].includes(nodeEnv)) {
    const tieneCredencial =
      process.env.FB_SERVICE_ACCOUNT_KEY ||
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
      process.env.FB_SERVICE_ACCOUNT_PATH ||
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.K_SERVICE || // Variable presente automáticamente en Google Cloud Functions / Cloud Run
      fs.existsSync(path.resolve(process.cwd(), 'serviceAccountKey.json'));

    if (!tieneCredencial) {
      console.error(
        `Error: En ambiente ${nodeEnv} se requiere credenciales de Firebase o ejecutar en Google Cloud.`
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
    projectId:
      process.env.FB_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID ||
      process.env.GCLOUD_PROJECT ||
      (nodeEnv === 'test' ? 'demo-tp-prog4' : undefined),
    databaseId: resolverDatabaseId(),
    serviceAccountPath:
      process.env.FB_SERVICE_ACCOUNT_PATH ||
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    serviceAccountKey:
      process.env.FB_SERVICE_ACCOUNT_KEY ||
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    emulatorHost: process.env.FIRESTORE_EMULATOR_HOST,
  },
};
