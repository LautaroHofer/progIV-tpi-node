# TP Programación IV - Backend Node.js (Usuarios y Salones)

API en Node.js con Express encargada del módulo de **Usuarios y Salones** (sucursales, salas, profesores, alumnos, planes y créditos) para el sistema de salones de bienestar y pilates.
*(El módulo de Horarios y Turnos se gestiona en el repositorio de Python con Django).*

## Integrantes (Grupo 1 - Comisión 2)
- Lautaro Hofer
- Erick Vicentin
- Santiago Nickisch

## Requisitos
- Node.js 22 LTS
- Docker y Docker Compose

## Cómo levantar (clon limpio)

1. Copiá las variables de entorno:
   ```bash
   cp .env.example .env
   ```

2. Levantá los servicios con Docker Compose:
   ```bash
   docker compose up
   ```

3. Ejecutá el comando de preparación:
   ```bash
   npm run setup
   ```

4. Ejecutá los tests:
   ```bash
   npm test
   ```

5. El servidor queda disponible en `http://localhost:3000`.

## Endpoints (Módulo Usuarios y Salones)

Ver documentación detallada en `docs/api.md`.

### Salud y disponibilidad
- `GET /health`
- `GET /ready`

### Sucursales y Salas
- `POST /api/sucursales`
- `GET /api/sucursales`
- `GET /api/sucursales/:id`
- `POST /api/salas`
- `GET /api/salas`
- `GET /api/salas/:id`
- `PUT /api/salas/:id`
- `DELETE /api/salas/:id`

### Usuarios (Profesores y Alumnos)
- `POST /api/profesores`
- `GET /api/profesores`
- `GET /api/profesores/:id`
- `PUT /api/profesores/:id`
- `DELETE /api/profesores/:id`
- `POST /api/alumnos`
- `GET /api/alumnos`
- `GET /api/alumnos/:id`
- `PUT /api/alumnos/:id`
- `DELETE /api/alumnos/:id`

### Planes y Créditos
- `POST /api/planes`
- `GET /api/planes`
- `GET /api/planes/:id`
- `PUT /api/planes/:id`
- `DELETE /api/planes/:id`
- `GET /api/creditos/:alumnoId`
- `POST /api/creditos/:alumnoId/agregar`
- `POST /api/creditos/:alumnoId/descontar`
- `GET /api/creditos/:alumnoId/historial`

## Usuarios de prueba
- `admin / admin123` — Administrador de cadena
- `recep / recep123` — Recepcionista de sucursal
- `profe / profe123` — Profesor
- `alumno / alumno123` — Alumno

## Documentación
- `docs/api.md` — Especificación de endpoints
- `docs/adr/` — Decisiones de arquitectura
- `docs/modelo.md` — Modelo de dominio (Usuarios y Salones)
- `docs/mediciones.md` — Informe de medición
- `docs/ataque.md` — Bitácora de ataque y respuestas
