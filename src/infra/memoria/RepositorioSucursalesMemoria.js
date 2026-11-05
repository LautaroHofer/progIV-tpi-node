// Adaptador en memoria de Sucursales para tests de dominio.

export class RepositorioSucursalesMemoria {
  constructor() {
    this.sucursales = new Map();
    this.contadorId = 1;
  }

  async crear(datos) {
    const nueva = { id: this.contadorId++, ...datos };
    this.sucursales.set(nueva.id, nueva);
    return nueva;
  }

  async listar() {
    return Array.from(this.sucursales.values());
  }

  async obtenerPorId(id) {
    return this.sucursales.get(Number(id)) || null;
  }
}
