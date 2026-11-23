import express from 'express';
import { db } from './db/conexion.js';
import rutasAlumnos from './routes/rutasAlumnos.js';
import rutasAuth from './routes/rutasAuth.js';
import rutasPlanes from './routes/rutasPlanes.js';
import rutasProfesores from './routes/rutasProfesores.js';
import rutasCreditos from './routes/rutasCreditos.js';
import rutasSucursales from './routes/rutasSucursales.js';
import rutasSalas from './routes/rutasSalas.js';
import { manejadorErrores } from './middlewares/error.js';
import { middlewareLogger, obtenerCorrelationId } from './middlewares/logger.js';

export function crearApp() {
  const app = express();
  app.use(express.json());
  app.use(middlewareLogger);

  app.get('/health', (req, res) => {
    res.json({ estado: 'ok', servicio: 'api-node-usuarios-salones' });
  });

  app.get('/ready', async (req, res) => {
    try {
      await db.collection('configuracion').doc('general').get();
      res.json({
        listo: true,
        servicio: 'api-node-usuarios-salones',
        baseDatos: 'conectada',
      });
    } catch {
      res.status(503).json({
        listo: false,
        servicio: 'api-node-usuarios-salones',
        baseDatos: 'no disponible',
      });
    }
  });

  app.use('/api/alumnos', rutasAlumnos);
  app.use('/api/auth', rutasAuth);
  app.use('/api/planes', rutasPlanes);
  app.use('/api/sucursales', rutasSucursales);
  app.use('/api/salas', rutasSalas);
  app.use('/api/profesores', rutasProfesores);
  app.use('/api/creditos', rutasCreditos);

  app.use((req, res) => {
    res.status(404).json({
      error: 'Endpoint no encontrado',
      codigo: 'NO_ENCONTRADO',
      correlationId: obtenerCorrelationId(),
    });
  });

  app.use(manejadorErrores);
  return app;
}
