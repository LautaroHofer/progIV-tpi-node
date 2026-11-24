import { config } from '../config/env.js';
import { ErrorValidacion } from './errores.js';

const CLAVES_PROHIBIDAS = new Set(['__proto__', 'constructor', 'prototype']);

// Agrega cabeceras HTTP defensivas en todas las respuestas
export function cabecerasSeguridad(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'");

  if (config.env === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}

// Restringe CORS a una lista explícita de orígenes permitidos (nunca '*')
export function corsRestringido(req, res, next) {
  const origen = req.headers.origin;
  if (!origen) {
    return next();
  }

  if (!config.corsOrigins.includes(origen)) {
    return res.status(403).json({
      error: 'Origen no permitido por CORS',
      codigo: 'CORS_NO_PERMITIDO',
    });
  }

  res.setHeader('Access-Control-Allow-Origin', origen);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,Idempotency-Key,X-Correlation-Id'
  );

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  return next();
}

function contieneClaveProhibida(valor) {
  if (!valor || typeof valor !== 'object') {
    return false;
  }
  if (Array.isArray(valor)) {
    return valor.some((item) => contieneClaveProhibida(item));
  }
  for (const clave of Object.keys(valor)) {
    if (CLAVES_PROHIBIDAS.has(clave) || contieneClaveProhibida(valor[clave])) {
      return true;
    }
  }
  return false;
}

// Rechaza payloads con claves que puedan causar Prototype Pollution
export function bloquearPrototypePollution(req, res, next) {
  if (contieneClaveProhibida(req.body) || contieneClaveProhibida(req.query)) {
    return next(new ErrorValidacion('Payload rechazado: contiene claves no permitidas'));
  }
  return next();
}

// Limitador de intentos en memoria por IP para proteger endpoints sensibles como /login
export function crearRateLimiter({ ventanaMs = 15 * 60 * 1000, maxIntentos = 10 } = {}) {
  const registros = new Map();

  function middleware(req, res, next) {
    const clave = req.ip || req.socket?.remoteAddress || 'desconocido';
    const ahora = Date.now();
    const actual = registros.get(clave);

    if (!actual || ahora > actual.reiniciaEn) {
      registros.set(clave, { intentos: 1, reiniciaEn: ahora + ventanaMs });
      return next();
    }

    actual.intentos += 1;
    if (actual.intentos > maxIntentos) {
      const segundosRestantes = Math.ceil((actual.reiniciaEn - ahora) / 1000);
      res.setHeader('Retry-After', String(Math.max(segundosRestantes, 1)));
      return res.status(429).json({
        error: 'Demasiados intentos. Intente nuevamente más tarde.',
        codigo: 'LIMITE_EXCEDIDO',
      });
    }

    return next();
  }

  middleware.reiniciar = () => registros.clear();
  return middleware;
}

export const rateLimitLogin = crearRateLimiter({
  ventanaMs: 15 * 60 * 1000,
  maxIntentos: 10,
});
