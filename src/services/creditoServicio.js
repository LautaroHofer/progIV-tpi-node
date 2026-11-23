import { db } from '../db/conexion.js';
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorValidacion,
} from '../middlewares/errores.js';

const COLECCION_ALUMNOS = 'alumnos';
const COLECCION_MOVIMIENTOS = 'movimientos_creditos';
const COLECCION_IDEMPOTENCIA = 'idempotencia_creditos';

// Ejecutar un movimiento de créditos dentro de una transacción atómica de Firestore
async function ejecutarMovimiento({
  alumnoId,
  cantidad,
  tipo,
  motivo = '',
  fechaVencimiento = null,
  idempotencyKey = null,
}) {
  const clave = idempotencyKey ? idempotencyKey.trim() : null;

  return db.runTransaction(async (tx) => {
    // 1. Idempotencia: si la clave ya se procesó, devolver el resultado guardado sin repetir el efecto
    const idemRef = clave ? db.collection(COLECCION_IDEMPOTENCIA).doc(clave) : null;
    if (idemRef) {
      const idemDoc = await tx.get(idemRef);
      if (idemDoc.exists) {
        return { ...idemDoc.data().resultado, idempotente: true };
      }
    }

    // 2. Leer el alumno dentro de la transacción
    const alumnoRef = db.collection(COLECCION_ALUMNOS).doc(alumnoId);
    const alumnoDoc = await tx.get(alumnoRef);
    if (!alumnoDoc.exists) {
      throw new ErrorNoEncontrado('Alumno no encontrado');
    }

    const saldoAnterior = Number(alumnoDoc.data().creditos || 0);
    let saldoNuevo = saldoAnterior;
    let devuelto = true;
    let tipoFinal = tipo;

    if (tipo === 'agregar') {
      saldoNuevo = saldoAnterior + cantidad;
    } else if (tipo === 'descontar') {
      if (saldoAnterior < cantidad) {
        throw new ErrorConflicto('Saldo de créditos insuficiente');
      }
      saldoNuevo = saldoAnterior - cantidad;
    } else if (tipo === 'devolver') {
      // Regla del TP: un crédito vencido no revive por una devolución posterior
      const estaVencido = fechaVencimiento && new Date(fechaVencimiento) < new Date();
      if (estaVencido) {
        devuelto = false;
        tipoFinal = 'devolucion_vencida';
      } else {
        saldoNuevo = saldoAnterior + cantidad;
      }
    }

    const ahora = new Date().toISOString();
    const movRef = db.collection(COLECCION_MOVIMIENTOS).doc();

    if (saldoNuevo !== saldoAnterior) {
      tx.update(alumnoRef, { creditos: saldoNuevo, actualizadoEn: ahora });
    }

    tx.set(movRef, {
      alumnoId,
      cantidad,
      tipo: tipoFinal,
      motivo: motivo.trim(),
      fechaVencimiento: fechaVencimiento || null,
      saldoAnterior,
      saldoNuevo,
      fecha: ahora,
    });

    const resultado = {
      movimientoId: movRef.id,
      alumnoId,
      tipo: tipoFinal,
      cantidad,
      devuelto,
      saldoAnterior,
      saldoNuevo,
    };

    if (idemRef) {
      tx.set(idemRef, { alumnoId, tipo: tipoFinal, resultado, creadoEn: ahora });
    }

    return resultado;
  });
}

export async function obtenerSaldo(alumnoId) {
  const doc = await db.collection(COLECCION_ALUMNOS).doc(alumnoId).get();
  if (!doc.exists) {
    throw new ErrorNoEncontrado('Alumno no encontrado');
  }
  return { alumnoId: doc.id, creditos: Number(doc.data().creditos || 0) };
}

export async function obtenerHistorial(alumnoId) {
  await obtenerSaldo(alumnoId);
  const snap = await db
    .collection(COLECCION_MOVIMIENTOS)
    .where('alumnoId', '==', alumnoId)
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export function agregarCreditos(datos) {
  return ejecutarMovimiento({ ...datos, tipo: 'agregar' });
}

export function descontarCreditos(datos) {
  if (!datos.idempotencyKey) {
    throw new ErrorValidacion('Encabezado Idempotency-Key obligatorio');
  }
  return ejecutarMovimiento({ ...datos, tipo: 'descontar' });
}

export function devolverCreditos(datos) {
  if (!datos.idempotencyKey) {
    throw new ErrorValidacion('Encabezado Idempotency-Key obligatorio');
  }
  return ejecutarMovimiento({ ...datos, tipo: 'devolver' });
}
