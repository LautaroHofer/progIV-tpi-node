/**
 * Script de verificación de variables de entorno obligatorias.
 * Se ejecuta antes de arrancar el servidor para fallar rápido si falta
 * alguna variable requerida, en lugar de romper en tiempo de ejecución.
 */

const requeridas = ['JWT_SECRET'];

const opcionalesRecomendadas = [
  'PORT',
  'PYTHON_API_URL',
  'FB_PROJECT_ID',
  'FB_DATABASE_ID',
];

const faltantes = requeridas.filter((clave) => !process.env[clave]);

if (faltantes.length > 0) {
  console.error(
    `Error: Faltan variables de entorno obligatorias: ${faltantes.join(', ')}`
  );
  console.error(
    'Copiá .env.example a .env y completá los valores antes de arrancar.'
  );
  process.exit(1);
}

const omitidas = opcionalesRecomendadas.filter(
  (clave) => !process.env[clave]
);

if (omitidas.length > 0) {
  console.warn(
    `Advertencia: Variables opcionales no definidas: ${omitidas.join(', ')}`
  );
}

console.log('✓ Variables de entorno validadas correctamente');
