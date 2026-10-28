# TP Programación IV - Backend Node.js

Sistema de gestión y reserva de turnos para salones de bienestar y pilates.

## Integrantes (Grupo 1 - Comisión 2)
- Lautaro Hoffer
- Erick Vicentin
- Santiago Nickisch

## Requisitos
- Node.js 18+
- Docker y Docker Compose

## Cómo levantar (clon limpio)

La corrección empieza con un clon limpio en una máquina virgen. La secuencia debe funcionar sin intervención:

1. Copiá las variables de entorno:
   ```bash
   cp .env.example .env
   ```
   (Ajustá valores si es necesario. No subas nunca un `.env` con secretos reales.)

2. Levantá los servicios con Docker Compose:
   ```bash
   docker compose up
   ```

3. Ejecutá el comando de preparación (crea esquema y carga datos de prueba):
   ```bash
   npm run setup
   ```

4. Ejecutá los tests con un comando único (deben pasar):
   ```bash
   npm test
   ```

5. Levantá el servidor y ejecutá la colección de requests de la demo.
   El servidor queda disponible en `http://localhost:3000`.

Si esta secuencia falla, el trabajo no se aprueba, sin importar el estado del código.

## Endpoints (30+)

Ver documentación detallada en `docs/api.md`.

### Salud
- `GET /salud`

### Sucursales (Lautaro)
- `POST /api/sucursales`
- `GET /api/sucursales`
- `GET /api/sucursales/:id`

### Salas (Lautaro)
- `POST /api/salas`
- `GET /api/salas`
- `GET /api/salas/:id`
- `PUT /api/salas/:id`
- `DELETE /api/salas/:id`

### Profesores (Lautaro)
- `POST /api/profesores`
- `GET /api/profesores`
- `GET /api/profesores/:id`
- `PUT /api/profesores/:id`
- `DELETE /api/profesores/:id`
- `GET /api/profesores/:id/agenda`

### Planes (Erick)
- `POST /api/planes`
- `GET /api/planes`
- `GET /api/planes/:id`
- `PUT /api/planes/:id`
- `DELETE /api/planes/:id`

### Créditos (Erick)
- `GET /api/creditos/:alumnoId`
- `POST /api/creditos/:alumnoId/agregar`
- `POST /api/creditos/:alumnoId/descontar`
- `GET /api/creditos/:alumnoId/historial`

### Reservas (Santiago)
- `POST /api/reservas`
- `GET /api/reservas`
- `GET /api/reservas/:id`
- `POST /api/reservas/:id/cancelar`
- `GET /api/reservas/alumno/:alumnoId`

### Lista de espera (Santiago)
- `POST /api/lista-espera`
- `GET /api/lista-espera/:claseId`
- `POST /api/lista-espera/:id/confirmar`

### Notificaciones (Santiago)
- `POST /api/notificaciones/recordatorio`
- `POST /api/notificaciones/lugar-disponible`

### Alumnos
- `POST /api/alumnos`
- `GET /api/alumnos`
- `GET /api/alumnos/:id`
- `PUT /api/alumnos/:id`
- `DELETE /api/alumnos/:id`

## Usuarios de prueba
- `admin / admin123` — Administrador de cadena
- `recep / recep123` — Recepcionista de sucursal
- `profe / profe123` — Profesor
- `alumno / alumno123` — Alumno

## Documentación
- `docs/api.md` — Especificación de endpoints (OpenAPI)
- `docs/adr/` — Decisiones de arquitectura
- `docs/modelo.md` — Modelo de dominio con diagrama
- `docs/mediciones.md` — Informe de medición de la tarea pesada
- `docs/ataque.md` — Bitácora de ataque y respuestas

## Reglas del repositorio
- Repositorio Git privado con la cátedra como colaboradora desde el primer control.
- Tag `entrega-final` marca el estado que se corrige.
- Todos los integrantes tienen commits propios a lo largo del cuatrimestre.
- Integración mediante Pull Requests revisados por al menos otro integrante con comentarios reales.
- No se suben secretos reales, `node_modules`, ni volcados de base de datos con datos personales.
- Sí se sube `.env.example` con todas las variables y valores de ejemplo.
