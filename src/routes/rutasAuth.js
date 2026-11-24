import express from 'express';
import { validarEsquema } from '../middlewares/validacion.js';
import { rateLimitLogin } from '../middlewares/seguridad.js';
import { registrar, login } from '../controllers/authControlador.js';

const router = express.Router();

router.post('/register', validarEsquema('registro'), registrar);
router.post('/login', rateLimitLogin, validarEsquema('login'), login);

export default router;
