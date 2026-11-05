// Archivo único de composición (Bloque 2).
// Acá se instancian los adaptadores concretos y se inyectan en los casos de uso de Usuarios y Salones.

import { RepositorioSucursalesMemoria } from './infra/memoria/RepositorioSucursalesMemoria.js';
import { NotificadorConsola } from './infra/externos/NotificadorConsola.js';

export function crearDependencias() {
  const sucursalRepo = new RepositorioSucursalesMemoria();
  const notificador = new NotificadorConsola();

  return {
    sucursalRepo,
    notificador,
  };
}
