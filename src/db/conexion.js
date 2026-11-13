import {
  initializeApp,
  cert,
  applicationDefault,
  getApps,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config/env.js";

let app;

if (getApps().length === 0) {
  const appOptions = {};

  // coonfigurar el Project ID si esta definido
  if (config.firebase.projectId) {
    appOptions.projectId = config.firebase.projectId;
  }

  const esEmulador = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

  // detectar el archivo de config predeterminado en la raiz del proyecto
  const defaultKeyPath = path.resolve(process.cwd(), "serviceAccountKey.json");
  const serviceAccountPath =
    config.firebase.serviceAccountPath ||
    (fs.existsSync(defaultKeyPath) ? defaultKeyPath : null);

  if (esEmulador) {
    if (!appOptions.projectId) {
      appOptions.projectId = "demo-tp-prog4";
    }
  } else if (config.firebase.serviceAccountKey) {
    // credenciales pasadas como string JSON o base64
    try {
      const raw = config.firebase.serviceAccountKey.trim();
      const jsonStr = raw.startsWith("{")
        ? raw
        : Buffer.from(raw, "base64").toString("utf-8");
      const serviceAccount = JSON.parse(jsonStr);
      appOptions.credential = cert(serviceAccount);
      if (!appOptions.projectId && serviceAccount.project_id) {
        appOptions.projectId = serviceAccount.project_id;
      }
    } catch (err) {
      console.error(
        "Error parseando FIREBASE_SERVICE_ACCOUNT_KEY:",
        err.message,
      );
    }
  } else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    // credenciales leidas desde el JSON local
    try {
      const fileContent = fs.readFileSync(serviceAccountPath, "utf-8");
      const serviceAccount = JSON.parse(fileContent);
      appOptions.credential = cert(serviceAccount);
      if (!appOptions.projectId && serviceAccount.project_id) {
        appOptions.projectId = serviceAccount.project_id;
      }
    } catch (err) {
      console.error(
        "Error leyendo archivo de credenciales de Firebase:",
        err.message,
      );
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    appOptions.credential = applicationDefault();
  } else if (config.env === "test" || config.env === "development") {
    // Fallback para pruebas unitarias sin conexion
    if (!appOptions.projectId) {
      appOptions.projectId = "demo-tp-prog4";
    }
  }

  app = initializeApp(appOptions);
} else {
  app = getApps()[0];
}

// Si se especificó una base de datos secundaria (ej. 'prod'), nos conectamos a ella;
// de lo contrario, utiliza la base de datos predeterminada '(default)'.
export const db =
  config.firebase.databaseId && config.firebase.databaseId !== '(default)'
    ? getFirestore(app, config.firebase.databaseId)
    : getFirestore(app);

export { app };
