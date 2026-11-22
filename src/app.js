import express from 'express';
import rutasAlumnos from './routes/rutasAlumnos.js';
import rutasPlanes from './routes/rutasPlanes.js';
import { manejadorErrores } from './middlewares/error.js';

export function crearApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ estado: 'ok', servicio: 'api-node-usuarios-salones' });
  });

  app.get('/ready', (req, res) => {
    res.json({ listo: true, servicio: 'api-node-usuarios-salones' });
  });

  app.use('/api/alumnos', rutasAlumnos);
  app.use('/api/planes', rutasPlanes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
  });

  app.use(manejadorErrores);
  return app;
}
