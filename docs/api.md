# API - Endpoints del backend Node.js

Base URL: `http://localhost:3000`

## Salud
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/salud` | Estado del servicio |

## Sucursales
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/sucursales` | Crear sucursal |
| GET | `/api/sucursales` | Listar sucursales |
| GET | `/api/sucursales/:id` | Obtener sucursal por ID |

## Salas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/salas` | Crear sala |
| GET | `/api/salas` | Listar salas |
| GET | `/api/salas/:id` | Obtener sala por ID |
| PUT | `/api/salas/:id` | Actualizar sala |
| DELETE | `/api/salas/:id` | Eliminar sala |

## Profesores
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/profesores` | Crear profesor |
| GET | `/api/profesores` | Listar profesores |
| GET | `/api/profesores/:id` | Obtener profesor por ID |
| PUT | `/api/profesores/:id` | Actualizar profesor |
| DELETE | `/api/profesores/:id` | Eliminar profesor |
| GET | `/api/profesores/:id/agenda` | Obtener agenda del profesor |

## Planes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/planes` | Crear plan |
| GET | `/api/planes` | Listar planes |
| GET | `/api/planes/:id` | Obtener plan por ID |
| PUT | `/api/planes/:id` | Actualizar plan |
| DELETE | `/api/planes/:id` | Eliminar plan |

## Créditos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/creditos/:alumnoId` | Obtener créditos de un alumno |
| POST | `/api/creditos/:alumnoId/agregar` | Agregar créditos |
| POST | `/api/creditos/:alumnoId/descontar` | Descontar créditos |
| GET | `/api/creditos/:alumnoId/historial` | Historial de créditos |

## Reservas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/reservas` | Crear reserva |
| GET | `/api/reservas` | Listar reservas |
| GET | `/api/reservas/:id` | Obtener reserva por ID |
| POST | `/api/reservas/:id/cancelar` | Cancelar reserva |
| GET | `/api/reservas/alumno/:alumnoId` | Reservas de un alumno |

## Lista de espera
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/lista-espera` | Unirse a lista de espera |
| GET | `/api/lista-espera/:claseId` | Listar espera de una clase |
| POST | `/api/lista-espera/:id/confirmar` | Confirmar lugar |

## Notificaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/notificaciones/recordatorio` | Enviar recordatorio de clase |
| POST | `/api/notificaciones/lugar-disponible` | Avisar lugar disponible en lista de espera |

## Alumnos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/alumnos` | Crear alumno |
| GET | `/api/alumnos` | Listar alumnos |
| GET | `/api/alumnos/:id` | Obtener alumno por ID |
| PUT | `/api/alumnos/:id` | Actualizar alumno |
| DELETE | `/api/alumnos/:id` | Eliminar alumno |

## Códigos de respuesta
- `200` OK
- `201` Created
- `400` Bad Request
- `401` No autorizado
- `403` Prohibido (no tiene permiso sobre el recurso)
- `404` No encontrado
- `409` Conflicto (ej. solapamiento, cupo lleno)
- `429` Demasiadas solicitudes (límite de tasa)
- `500` Error interno del servidor

## Errores posibles
- `Cupo agotado` - La clase no tiene lugares disponibles.
- `Solapamiento de horario` - El profesor o la sala ya están ocupados.
- `Sin créditos suficientes` - El alumno no tiene créditos para reservar.
- `Reserva no encontrada` - El ID de reserva no existe.
- `No es titular de la reserva` - El alumno no puede cancelar reservas ajenas.
