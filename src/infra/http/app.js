import express from 'express';
import rutasSucursales from './rutas/rutasSucursales.js';
import rutasSalas from './rutas/rutasSalas.js';
import rutasProfesores from './rutas/rutasProfesores.js';
import rutasPlanes from './rutas/rutasPlanes.js';
import rutasCreditos from './rutas/rutasCreditos.js';
import rutasReservas from './rutas/rutasReservas.js';
import rutasListaEspera from './rutas/rutasListaEspera.js';
import rutasNotificaciones from './rutas/rutasNotificaciones.js';
import rutasAlumnos from './rutas/rutasAlumnos.js';
import { manejadorErrores } from './middlewares/error.js';

export function crearApp() {
  const app = express();
  app.use(express.json());

  app.get('/salud', (req, res) => {
    res.json({ estado: 'ok', servicio: 'api-node' });
  });

  app.use('/api/sucursales', rutasSucursales);
  app.use('/api/salas', rutasSalas);
  app.use('/api/profesores', rutasProfesores);
  app.use('/api/planes', rutasPlanes);
  app.use('/api/creditos', rutasCreditos);
  app.use('/api/reservas', rutasReservas);
  app.use('/api/lista-espera', rutasListaEspera);
  app.use('/api/notificaciones', rutasNotificaciones);
  app.use('/api/alumnos', rutasAlumnos);

  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
  });

  app.use(manejadorErrores);
  return app;
}
