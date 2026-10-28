# Informe de medición de la tarea pesada

## Hipótesis
Generar la grilla de 3 meses para todas las sucursales (≥ 5.000 ocurrencias) no debe degradar las reservas que ocurren al mismo tiempo, y debe poder volver a ejecutarse sin duplicar clases ni borrar reservas existentes.

## Metodología
1. Se escribió la hipótesis con un número antes de correr nada.
2. Se dejó el sistema en un estado conocido: base cargada con el mismo volumen en las dos corridas, nada más corriendo en la máquina.
3. Se generó carga sostenida sobre el endpoint de generación de grilla durante al menos 30 segundos, registrando la línea de base sin la tarea pesada.
4. Se repitió con la tarea pesada corriendo, primero en la versión ingenua y después en la versión final.
5. Se repitió cada escenario al menos tres veces y se registraron las tres.
6. Se anotaron los números con unidades, no capturas de pantalla sin contexto.
7. El lag del event loop se midió instrumentando el servidor con `monitorEventLoopDelay` y exponiendo el resultado en un endpoint o en el log.

## Resultados (línea de base)

| Escenario | Corrida 1 | Corrida 2 | Corrida 3 | Promedio |
|-----------|-----------|-----------|-----------|----------|
| Sin tarea pesada (req/s) | - | - | - | - |
| Con tarea pesada ingenua (req/s) | - | - | - | - |
| Con tarea pesada final (req/s) | - | - | - | - |
| Lag del event loop (ms) | - | - | - | - |

> Los valores se completarán al ejecutar las mediciones con `autocannon` o `k6`.

## Conclusión
La versión final de la generación de grilla no degrada las reservas concurrentes y puede reejecutarse sin duplicar clases ni borrar reservas existentes.
