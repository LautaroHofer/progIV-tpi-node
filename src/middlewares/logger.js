import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

// Almacenamiento por pedido para propagar el correlationId entre operaciones asincrónicas
const almacenContexto = new AsyncLocalStorage();

export function obtenerCorrelationId() {
  return almacenContexto.getStore()?.correlationId || null;
}

function escribirLog(nivel, mensaje, datos = {}) {
  const entrada = {
    timestamp: new Date().toISOString(),
    nivel,
    correlationId: obtenerCorrelationId(),
    mensaje,
    ...datos,
  };

  const salida = JSON.stringify(entrada);
  if (nivel === 'error') {
    console.error(salida);
  } else {
    console.log(salida);
  }
}

export const logger = {
  info: (mensaje, datos) => escribirLog('info', mensaje, datos),
  warn: (mensaje, datos) => escribirLog('warn', mensaje, datos),
  error: (mensaje, datos) => escribirLog('error', mensaje, datos),
};

// Middleware que asigna un correlationId único por request y registra el resultado en JSON
export function middlewareLogger(req, res, next) {
  const headerId = req.headers?.['x-correlation-id'];
  const correlationId =
    typeof headerId === 'string' && headerId.trim() ? headerId.trim() : randomUUID();

  const inicio = Date.now();
  res.setHeader('X-Correlation-Id', correlationId);

  almacenContexto.run({ correlationId }, () => {
    res.on('finish', () => {
      logger.info('Pedido procesado', {
        metodo: req.method,
        ruta: req.originalUrl || req.url,
        statusCode: res.statusCode,
        duracionMs: Date.now() - inicio,
      });
    });

    next();
  });
}
