import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { crearApp } from './src/app.js';

// Colocamos las funciones en la misma región que la base de datos (São Paulo)
setGlobalOptions({ region: 'southamerica-east1' });

const app = crearApp();

// 1. API para Producción (apunta a turnapp-prod)
export const api = onRequest(
  {
    cors: true,
    env: {
      NODE_ENV: 'production',
      FB_DATABASE_ID: 'turnapp-prod',
    },
  },
  app
);

// 2. API para UAT / Staging (apunta a turnapp-uat)
export const apiUat = onRequest(
  {
    cors: true,
    env: {
      NODE_ENV: 'uat',
      FB_DATABASE_ID: 'turnapp-uat',
    },
  },
  app
);
