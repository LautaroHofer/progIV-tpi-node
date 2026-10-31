import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from '../../config/env.js';

let db;

/**
 * Inicializa Firebase Admin. Si no hay credenciales de servicio configuradas,
 * inicializa sin credencial (modo local/emulador o pruebas).
 */
export function inicializarFirebase() {
  if (getApps().length === 0) {
    let credencial = undefined;
    if (
      config.firebase.projectId &&
      config.firebase.clientEmail &&
      config.firebase.privateKey
    ) {
      credencial = cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      });
    }
    initializeApp({
      credential: credencial,
      databaseURL: config.firebase.databaseUrl,
      projectId: config.firebase.projectId,
    });
  }
  db = getFirestore();
  return db;
}

export function obtenerDb() {
  if (!db) {
    throw new Error(
      'Firebase no inicializado. Llamá a inicializarFirebase() primero.'
    );
  }
  return db;
}
