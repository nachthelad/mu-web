# EXP por spot

Diseño aprobado en el chat: módulo Analytics independiente, ventana flotante accesible desde HUB, medición manual de 300 segundos, historial local y ranking por EXP/min. No controla movimiento, combate ni Play.

La fuente es el evento `experienceGained` del cliente (`added`), emitido después de sumar la ganancia en `playerData.exp`; nunca convertir porcentajes ni usar tablas de EXP para inventar ganancias. Código público revisado: https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/logic.ts (applyExperienceGained). Subir de nivel continúa la medición; una caída de nivel/EXP la interrumpe. El cliente público no expone un contador de resets en PlayerData: mostrar no disponible.

Capturar servidor sin query/nonce, personaje, clase, mapa, coordenadas centrales, nivel inicial/final y nombres de party ordenados. Radio euclídeo de 8 casilleros; reutilizar el centro guardado más cercano dentro del radio para repetir un spot. Ranking separado por servidor/personaje/clase, bandas inicial y final de 50 niveles y tamaños de party observados. Solo muestras completas de 300 segundos; promedio ponderado por tiempo, número de pruebas y proyección por hora claramente rotulada.

Interrumpir por muerte, desconexión, cambio de mapa/personaje, carga, salida del radio, reset, Golden hunt, cambio del event bus, reloj que retrocede o cierre de página. Conservar ganancia confirmada anterior a la interrupción. Cerrar/minimizar la ventana no interrumpe. Guardar como máximo 500 muestras; al alcanzar el límite pedir exportar/borrar desde un control explícito, sin limpieza silenciosa. Exportar JSON. Datos inválidos o almacenamiento fallido no se sobrescriben; bloquear nuevas mediciones y mostrar error.

Ventana Shadow DOM arrastrable, minimizable, cerrada inicialmente, posición persistente y limitada al viewport. Acceso original montado por HUB mediante capabilities.actions; HUB no requiere modificación. Claves nuevas mu.analytics.history.v1 y mu.analytics.position.v1, claves demo separadas. Contrato v1 sin migrar claves existentes.

Gestor de releases: quinto módulo analytics, opcional al verificar conjuntos antiguos; rollback antiguo elimina solo su instalable generado. Mantener retención existente y todas las validaciones. Pruebas puras de medición, agrupación, datos inválidos y releases; demo sin cuenta y UI de controles, persistencia, integración temprana/tardía y viewport compacto. Release conjunta inicial. La simulación no confirma partida real.

## Revisión solicitada en el chat · Analytics 1.1.0 / HUB 1.4.3

Party variable no interrumpe. Capturar tamaños observados y cantidad de cambios sin cambiar la clave v1. Nueva tabla por mob, cantidad de muestras recibidas, promedio, mínimo y máximo. Agrupar por tipo del mob, mapa, nivel al recibir y cantidad de integrantes; conservar EXP personal sin normalizar bonus no conocidos. Las ganancias no identificadas tienen categoría explícita. Identificación por killedNetId y entidades recientes del cliente, cache de 2 segundos que caduca y se limpia por contexto. Historial anterior sin desglose permanece legible y no se reconstruye. Minimizar siempre es el último botón de HUB, después de acciones de módulos.

Analytics 1.1.2: Alt+Tab, ocultación de pestaña y scheduler retrasado no interrumpen. El plazo permanece 300000 ms y no se incluyen eventos recibidos fuera de él; no se reconstruye EXP que el cliente no recibió/procesó dentro del plazo. visibilitychange actualiza sin corte por visibilidad.
