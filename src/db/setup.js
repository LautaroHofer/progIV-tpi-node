import { db } from './conexion.js';

async function setup() {
  try {
    console.log('Inicializando colecciones y configuración base en Firestore...');

    // Inicializar documento de configuración general
    const configDoc = db.collection('configuracion').doc('general');
    await configDoc.set(
      {
        ventana_cancelacion_horas: 4,
        actualizado_en: new Date(),
      },
      { merge: true }
    );

    console.log('Configuración inicial guardada exitosamente en Firestore.');
    process.exit(0);
  } catch (err) {
    console.error('Error durante el setup de Firestore:', err);
    process.exit(1);
  }
}

setup();
