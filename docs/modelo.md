# Modelo de dominio

## Entidades

### Sucursal
- `id`: identificador único
- `nombre`: nombre de la sucursal
- `direccion`: dirección
- `creadoEn`: fecha de creación

### Sala
- `id`: identificador único
- `sucursalId`: sucursal a la que pertenece
- `nombre`: nombre de la sala
- `capacidad`: capacidad máxima (ej. 6 reformers)
- `creadoEn`: fecha de creación

### Profesor
- `id`: identificador único
- `nombre`: nombre del profesor
- `email`: correo electrónico
- `creadoEn`: fecha de creación

### Alumno
- `id`: identificador único
- `nombre`: nombre del alumno
- `email`: correo electrónico (único)
- `creditos`: saldo de créditos disponibles
- `creadoEn`: fecha de creación

### Plan
- `id`: identificador único
- `nombre`: nombre del plan
- `cantidadClases`: cantidad de clases incluidas
- `precio`: precio del plan
- `vigenciaMeses`: meses de vigencia
- `creadoEn`: fecha de creación

### Clase
- `id`: identificador único
- `salaId`: sala donde se dicta
- `profesorId`: profesor a cargo
- `actividad`: tipo de actividad
- `fechaInicio`: inicio de la clase
- `fechaFin`: fin de la clase
- `cupo`: lugares disponibles
- `recurrente`: si es clase recurrente

### Reserva
- `id`: identificador único
- `alumnoId`: alumno que reserva
- `claseId`: clase reservada
- `estado`: confirmada / cancelada / lista_espera
- `fechaReserva`: fecha de la reserva
- `creditoDescontado`: si se descontó crédito

### Credito
- `id`: identificador único
- `alumnoId`: alumno afectado
- `cantidad`: cantidad de créditos (positivo o negativo)
- `tipo`: debito / credito
- `motivo`: motivo del movimiento
- `fecha`: fecha del movimiento

### ListaEspera
- `id`: identificador único
- `claseId`: clase con cupo lleno
- `alumnoId`: alumno en espera
- `posicion`: orden de llegada
- `creadaEn`: fecha de inscripción

### Configuracion
- `clave`: clave de configuración (ej. `ventana_cancelacion_horas`)
- `valor`: valor de la configuración

## Invariantes
1. El cupo de una clase nunca excede la capacidad de la sala.
2. Un profesor no puede tener dos clases que se solapen en el tiempo.
3. Una sala no puede tener dos clases que se solapen en el tiempo.
4. Un alumno no puede tener dos reservas que se solapen (misma sucursal o distintas).
5. Un crédito se descuenta al reservar y se devuelve al cancelar dentro de la ventana permitida.
6. La devolución de crédito es idempotente: dos cancelaciones de la misma reserva devuelven un crédito, no dos.
7. Un crédito vencido no revive por una devolución posterior.

## Diagrama (texto)

```
Sucursal 1---* Sala
Sucursal 1---* Clase (a través de Sala)
Sala 1---* Clase
Profesor 1---* Clase
Clase 1---* Reserva
Alumno 1---* Reserva
Alumno 1---* Credito
Clase 1---* ListaEspera
Alumno 1---* ListaEspera
```
