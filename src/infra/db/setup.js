import { pool } from './conexion.js';

async function setup() {
  const client = await pool.connect();
  try {
    // Tablas base
    await client.query(`
      CREATE TABLE IF NOT EXISTS sucursales (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        direccion TEXT,
        creado_en TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS salas (
        id SERIAL PRIMARY KEY,
        sucursal_id INTEGER REFERENCES sucursales(id),
        nombre VARCHAR(100) NOT NULL,
        capacidad INTEGER NOT NULL DEFAULT 1,
        creado_en TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS profesores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150),
        creado_en TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS planes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        cantidad_clases INTEGER NOT NULL,
        precio NUMERIC(10,2) NOT NULL,
        vigencia_meses INTEGER NOT NULL DEFAULT 1,
        creado_en TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS alumnos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        creditos INTEGER NOT NULL DEFAULT 0,
        creado_en TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS clases (
        id SERIAL PRIMARY KEY,
        sala_id INTEGER REFERENCES salas(id),
        profesor_id INTEGER REFERENCES profesores(id),
        actividad VARCHAR(100) NOT NULL,
        fecha_inicio TIMESTAMP NOT NULL,
        fecha_fin TIMESTAMP NOT NULL,
        cupo INTEGER NOT NULL DEFAULT 1,
        recurrente BOOLEAN DEFAULT FALSE,
        creado_en TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reservas (
        id SERIAL PRIMARY KEY,
        alumno_id INTEGER REFERENCES alumnos(id),
        clase_id INTEGER REFERENCES clases(id),
        estado VARCHAR(30) NOT NULL DEFAULT 'confirmada',
        fecha_reserva TIMESTAMP DEFAULT NOW(),
        credito_descontado BOOLEAN DEFAULT FALSE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS creditos (
        id SERIAL PRIMARY KEY,
        alumno_id INTEGER REFERENCES alumnos(id),
        cantidad INTEGER NOT NULL,
        tipo VARCHAR(20) NOT NULL,
        motivo TEXT,
        fecha TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS lista_espera (
        id SERIAL PRIMARY KEY,
        clase_id INTEGER REFERENCES clases(id),
        alumno_id INTEGER REFERENCES alumnos(id),
        posicion INTEGER NOT NULL,
        creada_en TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        clave VARCHAR(100) PRIMARY KEY,
        valor TEXT NOT NULL
      );
    `);

    // Insertar configuración por defecto
    await client.query(`
      INSERT INTO configuracion (clave, valor)
      VALUES ('ventana_cancelacion_horas', '4')
      ON CONFLICT (clave) DO NOTHING;
    `);

    console.log('Tablas creadas correctamente.');
  } finally {
    client.release();
    await pool.end();
  }
}

setup().catch((err) => {
  console.error('Error en setup:', err);
  process.exit(1);
});
