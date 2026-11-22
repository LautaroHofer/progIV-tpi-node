import { crearApp } from './app.js';
import { config, validarVariablesEntorno } from './config/env.js';
import { logger } from './middlewares/logger.js';

validarVariablesEntorno();

const app = crearApp();
const PORT = config.port;
const TIMEOUT_APAGADO_MS = Number(process.env.SHUTDOWN_TIMEOUT_MS || 10000);

const server = app.listen(PORT, () => {
  logger.info('API Node.js iniciada', {
    puerto: PORT,
    ambiente: config.env,
    firestoreDb: config.firebase.databaseId,
  });
});

export { server };

let apagando = false;

function apagarOrdenadamente(senal) {
  if (apagando) return;
  apagando = true;

  logger.info('Señal de apagado recibida, cerrando conexiones activas', { senal });

  const temporizador = setTimeout(() => {
    logger.error('Tiempo límite de apagado superado, forzando salida', {
      timeoutMs: TIMEOUT_APAGADO_MS,
    });
    process.exit(1);
  }, TIMEOUT_APAGADO_MS);
  temporizador.unref();

  server.close((err) => {
    clearTimeout(temporizador);
    if (err) {
      logger.error('Error al cerrar el servidor HTTP', { detalle: err.message });
      process.exit(1);
    }
    logger.info('Servidor apagado ordenadamente');
    process.exit(0);
  });
}

process.on('SIGTERM', () => apagarOrdenadamente('SIGTERM'));
process.on('SIGINT', () => apagarOrdenadamente('SIGINT'));
