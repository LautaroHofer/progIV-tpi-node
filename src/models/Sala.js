// Entidad: Sala
export class Sala {
  constructor({ id, sucursalId, nombre, capacidad, creadoEn }) {
    this.id = id;
    this.sucursalId = sucursalId;
    this.nombre = nombre;
    this.capacidad = capacidad;
    this.creadoEn = creadoEn;
  }
}
