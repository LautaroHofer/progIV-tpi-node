# ADR 001 - Arquitectura del backend Node.js

## Estado
Aceptado

## Contexto
El TP Final de Programación IV requiere un backend en Node.js que gestione reservas de turnos para salones de bienestar y pilates. El sistema debe soportar concurrencia (50 intentos simultáneos sobre 6 lugares), seguridad (autorización por recurso), y arquitectura limpia (dominio separado de infraestructura).

## Decisión
Usar una arquitectura en capas con separación estricta entre dominio e infraestructura:

- `src/dominio/`: reglas de negocio, entidades y casos de uso. No importa Express ni el driver de la base de datos.
- `src/dominio/puertos/`: interfaces que el dominio necesita (repositorios, notificador, pagos).
- `src/infra/http/`: Express, rutas, middlewares, validación de entrada, traducción de errores a HTTP.
- `src/infra/db/`: adaptadores de persistencia, migraciones, consultas.
- `src/infra/externos/`: adaptadores de servicios externos (IA, mapas, correo, pagos).
- `src/infra/memoria/`: adaptadores falsos o en memoria para tests.
- `src/config/`: lectura y validación de variables de entorno.
- `src/composicion.js`: único lugar que crea adaptadores concretos y los inyecta.
- `src/servidor.js`: arranque, endpoints de salud, apagado ordenado por SIGTERM.

## Alternativas descartadas
- **Mezclar lógica de negocio en rutas de Express**: dificulta los tests y acopla el dominio al framework.
- **Usar un ORM sin justificación**: se optó por `pg` nativo para tener control total de las consultas SQL y poder explicarlas en la defensa. Se puede reconsiderar con un ADR nuevo.
- **TypeScript**: es opcional y no suma nota por sí mismo; no reemplaza la validación de entrada en tiempo de ejecución.

## Consecuencias
Positivas: el dominio es fácilmente testeable sin HTTP ni base de datos; la arquitectura cumple con el anexo 11.1 del enunciado.
Negativas: más archivos y boilerplate inicial.
