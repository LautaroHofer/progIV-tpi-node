# ADR 001 - Usamos arquitectura en capas tradicional (Rutas, Controladores, Servicios y Datos)

## Estado
Aceptado (reemplaza la propuesta preliminar de arquitectura hexagonal)

## Fecha y participantes
8 de noviembre de 2026.
Participaron: Lautaro Hofer, Erick Vicentin, Santiago Nickisch.

## Contexto
El sistema de gestión de salones de bienestar y pilates fue dividido en dos microservicios independientes: una API en Node.js con Express encargada de Usuarios y Salones, y otra en Python con Django para Horarios y Turnos.
Inicialmente se había contemplado una arquitectura hexagonal con puertos y adaptadores. Sin embargo, en un sistema distribuido en dos servicios con alcances bien delimitados y equipos reducidos, la sobrecarga de mantener puertos abstractos, adaptadores duplicados en memoria y módulos de composición manual agrega una complejidad accidental significativa que no aporta valor al negocio.

## Opciones consideradas
1. **Arquitectura Hexagonal (Puertos y Adaptadores)**:
   - *Ventajas:* Aislamiento total del dominio respecto a librerías e infraestructura; permite sustituir adaptadores fácilmente.
   - *Desventajas:* Requiere una gran cantidad de código repetitivo (interfaces simuladas en JS, adaptadores de memoria para cada entidad, inyección manual en `composicion.js`), dificultando la velocidad de desarrollo y agregando fricción innecesaria.
2. **Arquitectura en Capas Tradicional (Routes -> Controllers -> Services -> DB)**:
   - *Ventajas:* Organización estándar de la industria, flujo de dependencias unidireccional y predecible, separación clara de responsabilidades (HTTP en controladores, reglas de negocio en servicios, acceso a datos centralizado), permitiendo testear los servicios de negocio de forma unitaria sin levantar Express.
   - *Desventajas:* Si en el futuro se necesitara cambiar de motor de base de datos de manera dinámica, se requiere modificar los servicios o módulos de acceso a datos directamente.

## Decisión
Se decide adoptar una **Arquitectura en Capas Tradicional** organizada en:
- `src/routes/`: definición de rutas y verbos HTTP de Express.
- `src/controllers/`: manejo de peticiones (`req`), validaciones de formato y respuestas (`res`).
- `src/services/`: reglas y lógica de negocio pura (créditos, planes, notificaciones).
- `src/models/`: definiciones de entidades y esquemas de datos.
- `src/middlewares/`: autenticación, manejo centralizado de errores y control de acceso.
- `src/config/`: carga y validación estricta de variables de entorno.
- `src/db/`: conexión y utilidades de base de datos.

## Consecuencias
- **Qué gana el sistema:** Simplicidad, legibilidad, menor cantidad de archivos boilerplate, mayor agilidad para implementar features y facilidad para que cualquier integrante del grupo comprenda y modifique el código.
- **Qué pierde:** La capacidad de intercambiar el adaptador de almacenamiento cambiando únicamente un archivo de composición.
- **Qué queda más difícil:** Si se quisiera cambiar de base de datos en caliente, se deberán adaptar las llamadas en la capa de servicios o repositorio.

## Qué nos haría cambiar de decisión
Un cambio en los requisitos del proyecto que obligue a soportar múltiples motores de persistencia intercambiables simultáneamente o la necesidad de una lógica de dominio extremadamente compleja que justifique Domain-Driven Design (DDD) puro.
