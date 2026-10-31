// Único lugar que crea adaptadores concretos y los inyecta en los casos de uso.
// Adaptadores Firebase (Firestore) + adaptadores externos simulados.

import { inicializarFirebase } from './infra/firebase/conexion.js';
import {
  RepositorioSucursalesFirebase,
  RepositorioSalasFirebase,
  RepositorioClasesFirebase,
  RepositorioReservasFirebase,
  RepositorioAlumnosFirebase,
  RepositorioCreditosFirebase,
  RepositorioListaEsperaFirebase,
  RepositorioConfiguracionFirebase,
  RepositorioProfesoresFirebase,
} from './infra/firebase/adaptadores/index.js';
import { NotificadorSimulado } from './infra/externos/notificadorSimulado.js';
import { PagosSimulado } from './infra/externos/pagosSimulado.js';
import { CalendarioSimulado } from './infra/externos/calendarioSimulado.js';
import { ReservarTurno } from './dominio/casosDeUso/reservarTurno.js';
import { CancelarTurno } from './dominio/casosDeUso/cancelarTurno.js';
import { GenerarGrilla } from './dominio/casosDeUso/generarGrilla.js';

inicializarFirebase();

const sucursalRepo = new RepositorioSucursalesFirebase();
const salaRepo = new RepositorioSalasFirebase();
const claseRepo = new RepositorioClasesFirebase();
const profesorRepo = new RepositorioProfesoresFirebase();
const alumnoRepo = new RepositorioAlumnosFirebase();
const reservaRepo = new RepositorioReservasFirebase();
const creditoRepo = new RepositorioCreditosFirebase();
const listaEsperaRepo = new RepositorioListaEsperaFirebase();
const configuracionRepo = new RepositorioConfiguracionFirebase();

const notificador = new NotificadorSimulado();
const pagos = new PagosSimulado();
const calendario = new CalendarioSimulado();

export const casosDeUso = {
  reservarTurno: new ReservarTurno({
    reservaRepo,
    claseRepo,
    salaRepo,
    alumnoRepo,
    creditoRepo,
  }),
  cancelarTurno: new CancelarTurno({
    reservaRepo,
    alumnoRepo,
    creditoRepo,
    configuracionRepo,
  }),
  generarGrilla: new GenerarGrilla({
    claseRepo,
    sucursalRepo,
    profesorRepo,
  }),
};

export const repositorios = {
  sucursalRepo,
  salaRepo,
  claseRepo,
  profesorRepo,
  alumnoRepo,
  reservaRepo,
  creditoRepo,
  listaEsperaRepo,
  configuracionRepo,
};

export const externos = {
  notificador,
  pagos,
  calendario,
};
