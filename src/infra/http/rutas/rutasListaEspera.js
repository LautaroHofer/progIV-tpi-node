import express from 'express';
import {
  unirseListaEspera,
  listarListaEspera,
  confirmarLugar,
} from '../controladores/listaEsperaControlador.js';

const router = express.Router();

router.post('/', unirseListaEspera);
router.get('/:claseId', listarListaEspera);
router.post('/:id/confirmar', confirmarLugar);

export default router;
