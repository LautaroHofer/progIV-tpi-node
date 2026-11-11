# ADR 003 - Aislamiento de bases de datos por ambiente (Dev, UAT, Prod) y resolución dinámica por scripts

## Estado
Aceptado

## Fecha y participantes
11 de noviembre de 2026.  
Participaron: Lautaro Hofer, Erick Vicentin, Santiago Nickisch.

## Contexto
El sistema requiere operar en tres etapas bien diferenciadas del ciclo de vida del software:
1. **Desarrollo (Local / Dev):** Pruebas de nuevas funcionalidades, desarrollo activo y ejecución de scripts locales.
2. **UAT (User Acceptance Testing / Staging):** Pruebas integrales de aceptación, ataques de seguridad controlados por otros grupos de la cátedra y validación de historias de usuario con datos realistas pero no productivos.
3. **Producción (Prod):** Entorno final estable donde residen los datos reales y se evalúa la solución final.

Mezclar datos de desarrollo o pruebas de estrés/ataque en la misma base de datos donde se encuentra la información productiva o de aceptación genera riesgo de corrupción de datos, carreras de concurrencia accidentales y dificultad para limpiar el estado del sistema sin afectar otros entornos.

## Opciones consideradas

1. **Mono-base de datos con colecciones prefijadas o discriminador por documento (`ambiente: 'dev' | 'uat' | 'prod'`)**:
   - *Ventajas:* Un solo recurso a configurar.
   - *Desventajas:* Alto riesgo de contaminación de datos por consultas mal parametrizadas; requiere alterar todas las queries de la capa de servicios para inyectar filtros por ambiente; dificulta el vaciado o reseteo de datos en testing.

2. **Proyectos independientes de Firebase/Google Cloud (un proyecto por ambiente)**:
   - *Ventajas:* Aislamiento de facturación y cuotas al 100%.
   - *Desventajas:* Overhead administrativo para un proyecto universitario (crear y gestionar 3 proyectos en Google Cloud, 3 archivos de credenciales `serviceAccountKey.json`, configurar 3 veces Firebase Hosting y facturación Blaze por separado).

3. **Múltiples bases de datos de Cloud Firestore (Feature de Multiple Databases) en el mismo proyecto**:
   - *Ventajas:*
     - Aislamiento físico y lógico total entre bases de datos (`(default)`, `turnapp-uat` y `turnapp-prod`).
     - Cada base posee sus propias colecciones, índices y documentos sin riesgo de contaminación cruzada.
     - Un único proyecto centralizado (`turnapp-node`) con una única cuenta de servicio y facturación unificada.
     - Todas las bases se ubican en la misma región óptima (`southamerica-east1` - São Paulo).
     - Permite conectarse a cualquier base simplemente pasando el identificador a `getFirestore(app, databaseId)`.
   - *Desventajas:* Requiere el Plan Blaze habilitado en el proyecto.

## Decisión
Se decide adoptar la **Opción 3: Múltiples bases de datos independientes en Cloud Firestore** dentro del proyecto `turnapp-node`:

1. **Topología de bases de datos:**
   - **`(default)`**: Base de datos predeterminada asignada para **Desarrollo y Pruebas Locales**.
   - **`turnapp-uat`**: Base de datos dedicada para **UAT / Staging**.
   - **`turnapp-prod`**: Base de datos dedicada exclusivamente para **Producción**.

2. **Resolución dinámica por configuración (`src/config/env.js` y `src/db/conexion.js`):**
   - El sistema resuelve automáticamente el `databaseId` analizando las banderas de línea de comando (`--dev`, `--uat`, `--prod`), la variable `NODE_ENV` o la variable explícita `FIREBASE_DATABASE_ID`.
   - Se alimenta automáticamente a la instancia de Firestore mediante:
     ```javascript
     export const db =
       config.firebase.databaseId && config.firebase.databaseId !== '(default)'
         ? getFirestore(app, config.firebase.databaseId)
         : getFirestore(app);
     ```

3. **Scripts dedicados en `package.json`:**
   Se estandarizan los comandos de ejecución para que cualquier desarrollador o pipeline de CI/CD pueda levantar el entorno correspondiente sin tocar variables de entorno manualmente:
   - **Desarrollo:** `npm run dev` / `npm start` / `npm run setup`
   - **UAT:** `npm run dev:uat` / `npm run start:uat` / `npm run setup:uat`
   - **Producción:** `npm run dev:prod` / `npm run start:prod` / `npm run setup:prod`

4. **Trazabilidad en arranque (`src/servidor.js`):**
   El servidor imprime en consola el ambiente y la base de datos exacta a la que se encuentra vinculado al iniciar:
   ```text
   API Node.js escuchando en http://localhost:3000
   [Ambiente: UAT | Firestore DB: turnapp-uat]
   ```

## Consecuencias
- **Qué gana el sistema:** Total aislamiento de datos entre testing, aceptación y producción; cero riesgo de borrado o corrupción accidental; extrema comodidad para el equipo mediante scripts de npm de una sola palabra; y centralización de la infraestructura en un único proyecto de Google Cloud.
- **Qué pierde:** Al compartir cuota de proyecto, un ataque de denegación o consumo extremo en UAT podría impactar en la cuota general del proyecto si no se monitorea.
- **Qué queda más fácil:** Levantar réplicas de datos, resetear UAT de forma independiente y alternar entre ambientes en pruebas manuales (Bruno) y automatizadas.

## Qué nos haría cambiar de decisión
Un requerimiento que exija aislamiento estricto de cuotas y facturación financiera separada a nivel empresarial, lo que obligaría a migrar a proyectos independientes de Google Cloud.
