# Analytics 1.1.2 · EXP por spot

Instalable: `dist/analytics.user.js`. Fuente: `src/analytics/analytics.user.js`. Nuevo script independiente; HUB 1.4.3 monta su botón por capabilities.actions sin modificar el motor de Helper. También funciona sin HUB.

Abrir el botón EXP por spot y pulsar Medir 5 minutos. Captura mapa y centro, cuenta ganancias confirmadas, muestra EXP/min y al terminar guarda el resultado. Cerrar o minimizar la ventana conserva la medición. Radio euclídeo: 8 casilleros. Una repetición cercana reutiliza el centro más cercano guardado. El ranking compara únicamente muestras completas, separadas por servidor/personaje/clase, tamaños de party observados y bandas inicial/final de 50 niveles. EXP/h es una proyección. El promedio usa EXP total/tiempo total.

Interrupciones: muerte, desconexión, carga, cambio de personaje/servidor/mapa, salida del radio, caída de nivel o EXP, Golden hunt, cambio del bus, reloj que retrocede o cierre/recarga. Muestras parciales permanecen en Historial con su motivo; no entran al ranking. No cambia Play, combate, movimiento ni reset. Un cambio de equipo, buffs o competencia por monstruos afecta resultados sin poder detectarse automáticamente.

## Datos verificados en el cliente público el 2026-10-07

[store.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/store.ts) define `playerData.exp` acumulada total, `currentLvlExp` y `expToNextLvl`. No expone un contador de resets: Analytics muestra no disponible.

[logic.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/logic.ts) aplica `AddedExperience` en `applyExperienceGained`, suma a `playerData.exp` y emite `experienceGained` con `{added, killedNetId}` para variantes comunes y extendidas. Analytics escucha solo ese evento; no calcula ganancias desde porcentajes ni desde saltos de nivel, que pueden corregir el total del cliente. Requiere `window.__eventBus.on/off`, `__store`, `__world`, y usa `__social.partyMembers` si está disponible; si falta party se marca desconocida y se separa de los contextos conocidos. Los eventos son ganancias personales recibidas, incluidas las distribuidas por party, no EXP base del monstruo.

## Persistencia y límites

Claves nuevas `mu.analytics.history.v1` (`{version:1,records}`) y `mu.analytics.position.v1` (`{x,y}`). La demo usa `mu.analytics.demo-history.v1` / `mu.analytics.demo-position.v1`. No modifica claves anteriores. Exportar JSON preserva resultados; borrar requiere confirmación explícita. Máximo 500 muestras, sin descarte automático. Historial corrupto bloquea mediciones y permite exportar el valor original; no se sobrescribe. Fallo al guardar muestra aviso y permite exportar las muestras en memoria.

Demo: `demos/analytics/preview.html`, sin cuenta ni conexión. Pruebas: `tests/analytics.test.cjs`, `tests/analytics-ui.cjs`, `tests/releases.test.cjs`. Capturas `docs/screenshots/analytics-preview.png` y `analytics-compact-preview.png`. Código upstream y simulación local no confirman que la versión desplegada del juego emita los mismos eventos. Falta verificar medición de cinco minutos y subida de nivel en partida real.

Validación local completada: 120 pruebas de lógica y 12 suites UI; conjunto 2026-10-07T15-06-38-520Z-273fce con Analytics 1.0.0. Hashes de fuentes e instalables verificados. Incluye la corrección coordinada de Helper 1.15.2 para Arena 2/3/4.


## Analytics 1.1.0 · EXP recibida por mob

Entradas, salidas y reemplazos de integrantes no interrumpen. Se guardan tamaños observados y cantidad de cambios; el ranking de spots distingue pruebas con party variable. Los resultados previos siguen legibles, pero no contienen datos por mob y no se reconstruyen a partir del total. Los nuevos campos opcionales v1 son partySizes, partyChanges y mobs, sin cambiar claves.

Cada experienceGained usa killedNetId para buscar npcType y objectNameInWorld entre entidades del mapa observadas por el cliente. Un cache de hasta 2 segundos permite resolver una entidad recién retirada; se limpia por mapa/personaje/conexión, expira y reemplaza los IDs reutilizados. Si falta identificación, se conserva como Mob no identificado. No usa nombres o tipos de otros mapas ni infiere un mob desde la posición.

La tabla por mob muestra muestras de ganancia recibida, promedio, mínimo y máximo; separa por servidor/personaje/clase, mapa, tipo de mob, banda de nivel al recibir y cantidad de integrantes (desconocida si no disponible). Respeta personaje y bandas de la comparación seleccionada, permitiendo ver diferentes tamaños de party. Incluye ganancias de pruebas parciales, porque cada evento ya confirma ese importe. No equivale a kills propias ni a EXP base del monstruo: puede incluir reparto de party y bonus del servidor, buffs u otras condiciones. Sin las reglas reales del servidor no se normaliza ni divide arbitrariamente por cantidad de integrantes.

Actualizar Analytics 1.1.0 y HUB 1.4.3 desde dist. HUB conserva minimizar después de todas las acciones de módulos, sin importar orden de registro. Pruebas locales de party variable, stats por mob, cache/caducidad y persistencia; pendiente validar identificación y ganancias en partida real.

Release 1.1.0 completada: conjunto 2026-10-07T15-20-13-257Z-5b5470, 123 pruebas de lógica y 12 suites UI. Fuentes e instalables coinciden con los hashes del manifiesto. Capturas analytics-mobs-preview.png y analytics-hub-controls-preview.png usan ganancias simuladas, no resultados de partida real.


Analytics 1.1.1: la cabecera evita foco pointer en minimizar/restaurar/cerrar y libera foco residual; no intercepta Enter del juego. Teclado deliberado conserva foco y activación. Mediciones, datos y claves no cambian. Actualizar solamente Analytics.

## Analytics 1.1.2 · Medición en segundo plano

Alt+Tab, visibilidad oculta y pausas del scheduler no son cortes. Se mantiene el plazo monotónico original de 300000 ms: un refresh tardío cierra con 300000 ms y los eventos recibidos después del plazo no se agregan. visibilitychange actualiza la medición sin detenerla por visibilidad. Los demás controles de contexto permanecen. La fuente sigue siendo eventos de EXP personal recibidos: no se reconstruyen ganancias ni se atribuyen mobs a eventos que el cliente no procesó a tiempo. El addon no impide que el navegador congele/descargue una pestaña ni mantiene activa por sí mismo la conexión del juego. Regresión con visibilidad simulada, salto de timers de 60 s y ganancias dentro/fuera del plazo. Falta confirmar continuidad de red del juego real con Alt+Tab.
