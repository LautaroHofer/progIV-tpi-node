# API - Endpoints del backend Node.js (Usuarios y Salones)

Base URL: `http://localhost:3000`

## Salud
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Proceso vivo |
| GET | `/ready` | Listo para recibir peticiones |

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

## Alumnos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/alumnos` | Crear alumno |
| GET | `/api/alumnos` | Listar alumnos |
| GET | `/api/alumnos/:id` | Obtener alumno por ID |
| PUT | `/api/alumnos/:id` | Actualizar alumno |
| DELETE | `/api/alumnos/:id` | Eliminar alumno |

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
