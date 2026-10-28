// Entidad: Plan
export class Plan {
  constructor({ id, nombre, cantidadClases, precio, vigenciaMeses, creadoEn }) {
    this.id = id;
    this.nombre = nombre;
    this.cantidadClases = cantidadClases;
    this.precio = precio;
    this.vigenciaMeses = vigenciaMeses;
    this.creadoEn = creadoEn;
  }
}
