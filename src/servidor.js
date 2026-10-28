import express from 'express';
import dotenv from 'dotenv';
import { crearApp } from './infra/http/app.js';

dotenv.config();

const app = crearApp();
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`API Node.js escuchando en http://localhost:${PORT}`);
});

export { server };

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Apagando servidor...');
  server.close(() => {
    console.log('Servidor apagado.');
    process.exit(0);
  });
});