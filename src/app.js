import express from 'express';
import rutasSucursales from './routes/rutasSucursales.js';
import rutasSalas from './routes/rutasSalas.js';
import rutasProfesores from './routes/rutasProfesores.js';
import rutasPlanes from './routes/rutasPlanes.js';
import rutasCreditos from './routes/rutasCreditos.js';
import rutasNotificaciones from './routes/rutasNotificaciones.js';
import rutasAlumnos from './routes/rutasAlumnos.js';
import { manejadorErrores } from './middlewares/error.js';

export function crearApp() {
  const app = express();
  app.use(express.json());

  app.get('/salud', (req, res) => {
    res.json({ estado: 'ok', servicio: 'api-node-usuarios-salones' });
  });

  app.get('/health', (req, res) => {
    res.json({ estado: 'ok', servicio: 'api-node-usuarios-salones' });
  });

  app.get('/ready', (req, res) => {
    res.json({ listo: true, servicio: 'api-node-usuarios-salones' });
  });

  app.use('/api/sucursales', rutasSucursales);
  app.use('/api/salas', rutasSalas);
  app.use('/api/profesores', rutasProfesores);
  app.use('/api/planes', rutasPlanes);
  app.use('/api/creditos', rutasCreditos);
  app.use('/api/notificaciones', rutasNotificaciones);
  app.use('/api/alumnos', rutasAlumnos);

  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
  });

  app.use(manejadorErrores);
  return app;
}
