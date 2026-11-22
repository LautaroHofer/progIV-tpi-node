// Clases de errores propios del proyecto.
// Los servicios lanzan estos errores y el middleware error.js los traduce a respuestas HTTP.

export class ErrorApp extends Error {
  constructor(mensaje, statusCode = 500, codigo = 'ERROR_INTERNO') {
    super(mensaje);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.codigo = codigo;
  }
}

export class ErrorValidacion extends ErrorApp {
  constructor(mensaje = 'Datos inválidos') {
    super(mensaje, 400, 'VALIDACION');
  }
}

export class ErrorNoAutorizado extends ErrorApp {
  constructor(mensaje = 'No autorizado') {
    super(mensaje, 401, 'NO_AUTORIZADO');
  }
}

export class ErrorProhibido extends ErrorApp {
  constructor(mensaje = 'Acceso prohibido') {
    super(mensaje, 403, 'PROHIBIDO');
  }
}

export class ErrorNoEncontrado extends ErrorApp {
  constructor(mensaje = 'Recurso no encontrado') {
    super(mensaje, 404, 'NO_ENCONTRADO');
  }
}

export class ErrorConflicto extends ErrorApp {
  constructor(mensaje = 'Conflicto con el estado actual del recurso') {
    super(mensaje, 409, 'CONFLICTO');
  }
}
