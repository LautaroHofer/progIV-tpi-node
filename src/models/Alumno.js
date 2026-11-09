// Entidad: Alumno
export class Alumno {
  constructor({ id, nombre, email, creditos, creadoEn }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.creditos = creditos || 0;
    this.creadoEn = creadoEn;
  }
}
