# ADR 002 - Adopción de Cloud Firestore como motor de base de datos NoSQL documental

## Estado
Aceptado (reemplaza la propuesta preliminar de persistencia relacional con PostgreSQL)

## Fecha y participantes
11 de noviembre de 2026.  
Participaron: Lautaro Hofer, Erick Vicentin, Santiago Nickisch.

## Contexto
El módulo de **Usuarios y Salones** (desarrollado en Node.js con Express) fue concebido inicialmente utilizando PostgreSQL con el driver `pg` y tablas relacionales tradicionales creadas mediante scripts DDL manuales (`setup.js`).

A medida que el diseño del servicio evolucionó hacia entidades orientadas a documentos (alumnos, planes, sucursales y salas con configuraciones flexibles) y considerando que el módulo complementario de *Horarios y Turnos* corre en un servicio independiente en Python/Django, mantener una base de datos relacional dedicada para este microservicio presentaba fricciones en la gestión de migraciones continuas de esquema y una sobrecarga de infraestructura innecesaria para los entornos de despliegue (UAT y Producción).

## Opciones consideradas

1. **PostgreSQL Relacional (`pg` / ORMs)**:
   - *Ventajas:* Soporte de integridad referencial y restricciones de unicidad aplicadas de forma estricta a nivel de motor de base de datos (`FOREIGN KEY`, `UNIQUE`). Transacciones ACID clásicas.
   - *Desventajas:* Necesidad de orquestar y versionar migraciones DDL manuales; dependencia de contenedores o servidores con estado y almacenamiento persistente en la nube (lo que incrementa costos y complejidad operativa en despliegues como Render o Railway); mayor fricción para iterar sobre el modelo de datos.

2. **Cloud Firestore (NoSQL Documental Serverless con `firebase-admin`)**:
   - *Ventajas:*
     - Base de datos totalmente administrada y *serverless*: elimina la necesidad de aprovisionar y mantener servidores de base de datos dedicados.
     - Modelo de datos documental nativo en formato JSON/BSON, que se integra de manera directa y natural con Express.js.
     - Esquema flexible que facilita la evolución ágil de entidades sin migraciones bloqueantes.
     - Facilidad para soportar una estrategia multi-ambiente: emulador local para desarrollo y tests rápidos sin conexión, y proyectos aislados en la nube para UAT y Producción.
     - Capa gratuita generosa (Spark Plan) adecuada para el ciclo de vida del trabajo práctico.
   - *Desventajas:*
     - La integridad referencial y la unicidad de campos (como el email de alumnos) deben garantizarse explícitamente en la capa de servicios de la aplicación (`src/services/`) en lugar de depender de restricciones del motor de base de datos.
     - Las transacciones requieren la API funcional `db.runTransaction()` de Firestore.

## Decisión
Se decide adoptar **Cloud Firestore** a través de la librería oficial **`firebase-admin`**, manteniendo la arquitectura en capas tradicional definida en el **ADR 001**:
1. **Acceso centralizado:** La instancia de base de datos se inicializa y exporta en `src/db/conexion.js`.
2. **Estrategia multi-ambiente:**
   - **Local / Test:** Soporta el Emulador de Firestore (`FIRESTORE_EMULATOR_HOST`) para pruebas locales sin costo ni conexión a internet.
   - **UAT / Producción:** Conexión segura mediante cuenta de servicio (`serviceAccountKey.json` o variable de entorno `FIREBASE_SERVICE_ACCOUNT_KEY`).
3. **Gobierno de invariantes en la Capa de Servicios:** La capa `src/services/` asume la responsabilidad de validar las reglas de negocio (ej. unicidad de email, inicialización de créditos en 0) antes de persistir los documentos.

## Consecuencias
- **Qué gana el sistema:** Mayor agilidad de desarrollo, cero costo de infraestructura de base de datos en la nube, compatibilidad nativa con JSON en Node.js, facilidad para levantar ambientes de testing aislados y eliminación de dependencias de contenedores SQL locales para el equipo.
- **Qué pierde:** Restricciones de integridad referencial y unicidad automáticas a nivel de motor.
- **Qué queda más difícil:** Garantizar unicidad o consistencia ante escrituras altamente concurrentes requiere aplicar transacciones atómicas explícitas (`runTransaction`) en la capa de servicios.
