import { crearApp } from './app.js';
import { config, validarVariablesEntorno } from './config/env.js';

validarVariablesEntorno();

const app = crearApp();
const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`API Node.js escuchando en http://localhost:${PORT}`);
  console.log(`[Ambiente: ${config.env.toUpperCase()} | Firestore DB: ${config.firebase.databaseId}]`);
});

export { server };

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Apagando servidor...');
  server.close(() => {
    console.log('Servidor apagado.');
    process.exit(0);
  });
});
