import {
  initializeApp,
  cert,
  applicationDefault,
  getApps,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "node:fs";
import { config } from "../config/env.js";

let app;

if (getApps().length === 0) {
  const appOptions = {};

  // coonfigurar el Project ID si esta definido
  if (config.firebase.projectId) {
    appOptions.projectId = config.firebase.projectId;
  }

  // no usar credenciales reales en caso de ser --test
  const esEmulador = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

  if (esEmulador) {
    if (!appOptions.projectId) {
      appOptions.projectId = "demo-tp-prog4";
    }
  } else if (config.firebase.serviceAccountKey) {
    // credenciales pasadas como string base64 para integrar con railway o firebase
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
  } else if (
    config.firebase.serviceAccountPath &&
    fs.existsSync(config.firebase.serviceAccountPath)
  ) {
    // credenciales pasada por path al json local
    try {
      const fileContent = fs.readFileSync(
        config.firebase.serviceAccountPath,
        "utf-8",
      );
      const serviceAccount = JSON.parse(fileContent);
      appOptions.credential = cert(serviceAccount);
      if (!appOptions.projectId && serviceAccount.project_id) {
        appOptions.projectId = serviceAccount.project_id;
      }
    } catch (err) {
      console.error(
        "Error leyendo FIREBASE_SERVICE_ACCOUNT_PATH:",
        err.message,
      );
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    appOptions.credential = applicationDefault();
  } else if (config.env === "test" || config.env === "development") {
    // fallback para pruebas locales antes de configurar credenciales
    if (!appOptions.projectId) {
      appOptions.projectId = "demo-tp-prog4";
    }
  }

  app = initializeApp(appOptions);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export { app };
