import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { crearApp } from "./src/app.js";

// Colocamos las funciones en la misma región que la base de datos (us-south1)
setGlobalOptions({ region: "southamerica-east1" });

const app = crearApp();

// Exportamos la API en Express para Cloud Functions
export const api = onRequest({ cors: true }, app);
