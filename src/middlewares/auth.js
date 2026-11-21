import jwt from 'jsonwebtoken';

/**
 * Extrae el token del header Authorization con formato 'Bearer <token>'.
 * Retorna el token string o null si no está presente o tiene formato inválido.
 */
export function extraerTokenBearer(req) {
  const authHeader = req.headers.authorization || '';
  const partes = authHeader.split(/\s+/);

  if (partes.length !== 2 || partes[0].toLowerCase() !== 'bearer') {
    return null;
  }

  const token = partes[1];
  return token || null;
}

/**
 * Middleware de autenticación JWT.
 * Verifica el token del header Authorization y adjunta el payload en req.usuario.
 * Si falta, expiró o la firma es inválida, responde 401 Unauthorized.
 */
export function requiereAuth(req, res, next) {
  const token = extraerTokenBearer(req);

  if (!token) {
    return res.status(401).json({
      error: 'Token de autenticación requerido o con formato inválido',
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      error: 'Configuración de autenticación incompleta en el servidor',
    });
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    req.usuario = payload;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware de autorización por rol.
 * Verifica que el usuario autenticado posea alguno de los roles permitidos.
 * Debe usarse después de requiereAuth.
 */
export function requiereRol(rolesPermitidos) {
  const roles = new Set(rolesPermitidos);

  return (req, res, next) => {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!usuario.rol || !roles.has(usuario.rol)) {
      return res.status(403).json({
        error: 'No tenés permisos suficientes para realizar esta acción',
      });
    }

    return next();
  };
}

/**
 * Middleware de autorización por permiso.
 * Verifica que el usuario autenticado incluya el permiso requerido en el JWT.
 * Debe usarse después de requiereAuth.
 */
export function requierePermiso(permisoRequerido) {
  return (req, res, next) => {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const permisos = usuario.permisos;

    if (!Array.isArray(permisos) || !permisos.includes(permisoRequerido)) {
      return res.status(403).json({
        error: 'No tenés el permiso requerido para realizar esta acción',
      });
    }

    return next();
  };
}
