import { inicializarFirebase, obtenerDb } from './conexion.js';

async function setup() {
  const db = inicializarFirebase();

  // Colecciones base del dominio (Firestore crea documentos al escribir, pero
  // aquí dejamos constancia de las colecciones que usará la aplicación).
  const colecciones = [
    'sucursales',
    'salas',
    'profesores',
    'alumnos',
    'planes',
    'clases',
    'reservas',
    'creditos',
    'listaEspera',
    'configuracion',
  ];

  for (const nombre of colecciones) {
    await db.collection(nombre).doc('_inicializacion').set({
      creadoEn: new Date(),
      nota: `Colección ${nombre} inicializada`,
    });
    await db.collection(nombre).doc('_inicializacion').delete();
  }

  // Configuración por defecto (ventana de cancelación en horas)
  await db
    .collection('configuracion')
    .doc('ventana_cancelacion_horas')
    .set({ clave: 'ventana_cancelacion_horas', valor: '4' });

  console.log('Firestore configurado correctamente.');
}

setup().catch((err) => {
  console.error('Error en setup:', err);
  process.exit(1);
});
