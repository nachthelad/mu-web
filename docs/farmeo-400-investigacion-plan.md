# Farmeo a nivel 400: investigación y plan

Fecha: 22/10/2026, hora de Argentina. Auditoría pública realizada entre 00:03 y 00:07 UTC del 23/10 (21:03–21:07 del 22/10 en Argentina).

**Objetivo:** agregar Farmeo sin Home en Aida/Kanturu mediante F10 y el Play/Pausa existente, manteniendo Leveleo y reset según nivel y preferencias. **Esta entrega solo investiga y planifica.**

**Arquitectura propuesta:** política de modo dentro del Helper y su refresh de 500 ms, un solo propietario de acciones, adaptador de combate manual por build y los mismos controles originales proyectados al panel externo. JavaScript/userscripts y MV3 existentes; fixtures Node y navegador aislado para validación futura. La especificación es el comportamiento acordado en el pedido, desarrollado abajo. No hay implementación, release ni autorización para cuenta real.

## 1. Dictamen y alcance de la evidencia

**Viable técnicamente en el cliente, condicionado a compatibilidad comprobada por acción y a validación posterior del servidor. No está demostrado un farmeo real a nivel 400.** Home tiene un bloqueo explícito por nivel; los sistemas manuales de ataque, casteo y recogida inspeccionados son independientes de ese bloqueo. No basta modificar `autoReset`, quitar un límite o volver a intentar Home.

El futuro desarrollo tiene dos puertas separadas:

1. Combate: demostrar selección, ejecución, recursos y cancelación en el build exacto, sin Home. Desconocido o incompleto significa bloqueo con diagnóstico; nunca parchear la restricción nativa.
2. Catálogo: hay seis destinos nuevos publicados, pero el catálogo de traslados 0.97d no publica la correspondencia exacta de cada destino con mundo/coordenadas. No inventarla. El selector debe incorporarlos en el futuro cambio; su traslado no se puede habilitar hasta resolver y validar esa correspondencia.

No se necesita una decisión adicional del usuario para terminar este informe. La incertidumbre sobre el servidor y las variantes requiere evidencia técnica, no elegir números por preferencia.

### Estado y restricciones conservadas

- Se leyeron `AGENTS.md`, `README.md`, `docs/organization-and-updates.md`, `docs/addon-design.md`, `docs/extension-architecture.md`, `docs/level-routes.md`, `docs/client-kanturu.md` y `docs/client-oct22.md`; también programación horaria y fuentes pertinentes.
- HEAD observado: `268a14d` (`Keep configuration visible and persist helmet switch`). El árbol ya tenía modificaciones y eliminaciones en fuentes, documentos, pruebas, dist/releases y archivos sin seguimiento. No se limpió, restauró, agregó al índice ni confirmó nada. La única escritura de esta tarea es este documento.
- Motores en la pestaña del juego; worker/puentes/HUB/panel transportan o presentan. Se conservan contrato v1, perfil compartido por cuenta, identidad de sesión, claves, Guardar/Cancelar/rollback y pausa manual.
- No se ejecutó boot, login, sockets de juego ni comandos de cuenta. No se instalaron extensiones ni dependencias, no hubo push, publicación o mensajes a otros chats. Las consultas de red fueron GET de recursos públicos y análisis en memoria.

## 2. Build público exacto y evidencia reproducible

Origen: [Mu Garden](https://mu.mormon.garden/). La raíz enlaza `./assets/index-C5JIMxmo.js`; este carga `layout-A1P3A0u1.js` y `boot-BJb3X1Q4.js`. Se descargaron en memoria y los hashes coinciden con los archivos existentes en `artifacts/client-kanturu/`:

| Asset público | SHA-256 |
| --- | --- |
| `index-C5JIMxmo.js` | `718afd9e38d6e9ccb90b7894e9e1553d14857512e47a49eae7366796472fb84a` |
| `layout-A1P3A0u1.js` | `9ba0a87ade11cb00012f7895ef26c567aea56adda7ce8db74d07ee6d0176e94d` |
| `boot-BJb3X1Q4.js` | `6aff122a4181f909ea52ccad6c87298b76a0f4031049ee886a05501612963ef0` |
| `index-Da6Qw7tS.js` (definición pública 0.97d) | `1607e0a57a312b0bf353aabcf76a8e9d873cec64bbf89d4a720fb40ffa7ea896` |
| `Data-v097d/Gate.bmd` (900 bytes, HTTP 200) | `502f53820bba151361c6b63ebcae8e06ec757fce3457f146c50b8980df760a3a` |

Última reconsulta: `2026-10-23T00:07:13.150Z`; raíz conserva el entry y el layout conserva su hash. Los índices indicados abajo son offsets de caracteres JavaScript, base cero, sobre texto UTF-8 decodificado, no offsets de bytes. Buscar símbolos además del offset. No se escribió otra copia de los assets.

La definición de entrada ofrece Season 6 y 0.97d, con 0.97d como predeterminado. El catálogo siguiente pertenece a la definición **0.97d**, no demuestra el protocolo de una cuenta conectada. Un futuro adaptador debe comprobar también la versión de juego activa; no trasladar datos de Season 6 por semejanza.

### Bloqueo de Home, independiente del combate manual

En layout, `ITt=400`, `ATt(e)` devuelve `e>=ITt` y `toggleMuHelper()` (offset 3989482) hace `if(!t&&ATt(this.playerData.level)){DTt();return}`. `DTt` abre el aviso; no envía una activación. Si Home ya estaba activo, permite pedir su pausa. En boot, `zme` (625129), tick del MU Helper nativo, también comprueba nivel y solicita detenerlo. No se propone alterar ninguno de esos caminos.

Comprobación ejecutada en memoria con el cuerpo extraído de `toggleMuHelper`, notificación y envío sustituidos por contadores: nivel 399/Home apagado → un envío; nivel 400/Home apagado → aviso y cero envíos. Esto reproduce el bloqueo cliente mostrado por el usuario. No demuestra qué valida el servidor.

### Ataque manual, objetivos, alcance y cadencia

| Evidencia | Flujo observado e implicación |
| --- | --- |
| layout `ZSt` (3625398), `kF`, `XSt`, `$St` | Separa monstruos atacables y jugadores. Rechaza fuera de alcance de entidades, muertos, invocaciones, NPC excluidos y zona segura del héroe/objetivo. El futuro Farmeo debe aceptar solo monstruos comprobados, nunca el camino PvP. `huntVisible`/`levelMonster` no sustituyen por sí solos ese predicado vigente. |
| layout `qzt` (3626279) | Lee `world.attackTarget`, valida objetivo y `worldIndex===mapIndex`, se acerca con `playerMoveTo` si está lejos y envía ataque mediante el sistema nativo. No consulta Home ni el nivel 400. No completar un `worldIndex` ausente artificialmente. |
| layout `Znt` (3287974), `Xnt`, `uo` | Alcance básico según equipo: 1.8, 2.2 con arma de categoría correspondiente y 6 con lanzador. Verifica munición y durabilidad. No es un rango universal para skills. |
| layout `qzt`, `cTe`, `uo.inputGateOpen` | Aproximación limitada por `jSt=.4` s; ataque espera puerta de entrada, duración/animación y piso por velocidad. `cTe(v)=max(60,450-min(v,200)*1.2)/1000*1.1`. El refresh del addon no debe enviar paquetes ni imponer una cadencia propia. |
| boot control manual alrededor de 721000–722500 y barra móvil alrededor de 455900 | El cliente crea `attackTarget`/`castRequest` desde entradas manuales; no son propiedad exclusiva de Home. El jugador puede sobrescribirlos. |

**Hallazgo de cancelación:** `qzt` llama `uo.update()` antes de leer el target actual. `uo.startAttack` conserva un callback de envío ligado a la animación; limpiar `attackTarget` no cancela ese callback. `tie()` limpia `Fp`; se expone como `uo.cancelAttack()`. El singleton `uo` está exportado como `ll` en este layout.

Se ejecutó el cuerpo extraído de `qzt` con dependencias de animación/red sustituidas, héroe a 400, Home apagado y monstruo válido. Resultado: cero envíos antes de animación; al limpiar solo target, el siguiente update envió uno; al cancelar explícitamente el callback antes del update, no apareció otro envío. Es una prueba local del orden de ejecución y de la limitación de la limpieza histórica, no de cadencia/daño real. El uso futuro de `cancelAttack()` debe estar condicionado a propiedad de la acción; cancelar indiscriminadamente también podría interrumpir un ataque manual.

### Skills, recursos y cancelación

- `store.selectSkill(t)` (layout 3990347) solo selecciona si existe en `store.skills`. No valida por sí mismo que sea una habilidad de ataque, que tenga recursos ni que pueda cancelarse.
- `rs`/`oZe` resuelven 383 definiciones estáticas (export `aA`); incluyen clase, energía/nivel, tipo, objetivo, distancia, mana y AG. `Qbt` (export `az`) expone `usability`, `canUse`, `cooldownRemaining`, etc. Importar únicamente el módulo ya cacheado del build comprobado; comprobar forma/versión de cada capacidad antes de usarla.
- `CF` (layout 3812130) informa bloqueos de clase, nivel, energía, arma, mana, AG, cooldown y safezone. Una skill aprendida afecta la regla de clase; hay que respetar el predicado nativo completo, no reescribirlo con un catálogo genérico. No contiene un bloqueo general a nivel 400 ni consulta Home.
- Comprobación extraída de `CF`: skill 1, aprendida, nivel 400, energía y recursos suficientes y Home ausente → usable; con MP=0 → `blocks:['mana']`. Las dependencias fueron sustituidas y no hubo envío.
- `V0e` (boot 743665) consume `castRequest`; resuelve el tipo/objetivo, munición, safezone, recursos/cooldown por `Ke.canUse`, alcance y animación. Alcance habitual: `distance+.5` o fallback `gN=1.8`; acercamiento cada `.4` s. Casteo común envía mediante el cliente y borra la solicitud si no se mantiene el botón derecho. No simular ese botón ni mantenerlo forzado desde el addon.
- No hay una sola ruta universal: objetivo explícito, área, Nova cargada, invocación, teleport, Dark Side, ráfagas y desplazamiento dentro de animación tienen ramas distintas. Nova figura como `DirectHit`: filtrar solo por `type` sería insuficiente. Las ramas con carga, ráfagas o movimiento diferido exigen auditoría de cancelación propia antes de admitirse.
- El envío de ataque/skill no equivale a daño. `ObjectHit`/`ObjectHitExtended`, `ObjectGotKilled`, actualizaciones de recursos y animaciones son señales diferentes. Correlación temporal no prueba causalidad; ausencia de señal exige espera acotada y diagnóstico, nunca aumentar envíos.

No se encontró en los caminos manuales inspeccionados una prohibición general por nivel 400. **Eso no prueba ausencia de restricciones del servidor, antiabuso, alcance efectivo o costes diferentes.** No se inspeccionó una cuenta ni una ejecución real.

## 3. Reutilización de fuentes actuales y alcance funcional propuesto

| Fuente/símbolo local | Qué sirve y qué debe cambiar en el futuro |
| --- | --- |
| `src/helper/level-helper.user.js`: `Cycle.start/step/transitionDue` (287+), `NativeHelper.sync` (396+) | Hoy continúa la ruta con `autoReset=false` y combate con acciones `helper`. Incorporar resolución de modo antes de validar ruta/enviar acciones; Farmeo no debe exigir una ruta de leveleo utilizable. Conservar reset/reingreso y el servicio de Home para Leveleo/Balrog. |
| `enact`, `serviceHelper` (1208+) | Reutilizar arbitraje/cola, pero separar requisitos de Home por acción. Hoy el despachador pasa por `native.sync` incluso para acciones históricas manuales. Farmeo necesita Home apagado confirmado al tomar control, y después no pedir activación. |
| `clearOwned`, `clearHuntTargets` (1150+) | Base de propiedad por referencia; no garantizan cancelar callbacks de animación ni todas las aproximaciones. Crear limpieza del propietario Farmeo, con sesión/generación y cancelación nativa comprobada. No vaciar acciones ajenas. |
| `huntAttack`/`huntLoot` (1249+), `GoldenHunt`, listeners | Son antecedentes, no función actual. `serviceHelper` exige `gold.active`; `actions.gold` es inerte y el listener reactivo está retirado. No habilitar Golden hunt ni reutilizar su activación. Su primera skill de Home y filtros históricos no establecen compatibilidad. |
| `SoulShield` (599+) | Ya puede lanzar sin Home. Skill 16 corresponde a Soul Barrier: buff, mana 70/AG 22/energía 408, no ataque universal. El código actual verifica aprendizaje y recursos parciales, no reemplaza `usability` vigente. Integrarlo solo con capacidad validada y exclusión con combate/loot; conservar su ajuste. |
| `ExcellentLoot` (447+), `matchesLoot`, `nativeLootConflict` | Un solo pending, confirmaciones y filtros reutilizables; hoy requiere `cycle.running` y Home activo, además de stage/settled. Reemplazar contexto de disponibilidad, no duplicar recogedor. |
| `manualLevelToggle`, `quickKey`, `hubModule.actions.toggle`, `.toggle`, `getState`, `render` | Conservar una sola entrada de intención para F10/Play del juego/HUB/panel. Añadir modo/estado opcionales; no crear `actions.farm` que sea otra activación pública. |
| `DailySchedule`, `evaluateSchedule`, `pauseLevel`, `toggleBalrog` | Extender al modo resuelto, conservar registro/lease e inhibiciones. Balrog hoy viaja y usa Home: a 400 no está demostrado y debe rechazarse antes de quitar un Farmeo activo. |

### Habilidad de combate y capacidades admitidas

Propuesta sin configuración universal por clase:

- Caza → Farmeo ofrece «Usar habilidad seleccionada en el juego al iniciar» como valor inicial, o selección explícita entre habilidades aprendidas **y compatibles** del personaje conectado. Sin habilidad apta: explicar y bloquear Play de Farmeo, sin elegir la primera de Home ni sustituirla por ataque básico silenciosamente.
- Resolver y fijar la skill al activar; capturar identidad, clase y equipo/capacidades pertinentes. No seguir cambiándola en cada tick por cambios de `currentSkill`. Un cambio manual incompatible pausa y devuelve el control.
- La selección explícita se guarda por cuenta, como las demás preferencias, y se revalida al cambiar personaje/clase. No introducir subperfiles ni migración por personaje incidentalmente. Un valor incompatible se conserva y se muestra como tal.
- Capacidad por build y semántica de skill: empezar con ataques de objetivo/área cuyo flujo completo esté extraído y cuya cancelación esté probada; no habilitar una clase solo por su nombre o un tipo genérico. Ataque básico requiere resolver el callback diferido y su propiedad antes de admitirse como opción explícita. Sin capacidad de cancelación suficiente, esa opción se bloquea.
- Sin recursos: estado `Farmeando · esperando MP/AG/munición` mientras la sesión siga válida, sin nuevos casts ni bucles de error. Si pierde skill/arma requerida o falta la capacidad de lectura, pausa con motivo. La cadencia la determina el sistema manual del cliente.

### Qué se pierde al apagar Home

Home deja de administrar búsqueda/ataque, skills y combo, curación/pociones, mana, buffs/soporte de party, reparación, recogida y retorno de su radio. Boot `Ume/zme` confirma que esas tareas pertenecen al tick nativo activo. La rama de pociones histórica del addon solo corre con `gold.active`, que está retirado; no protege Farmeo.

Alcance inicial propuesto: combate compatible, spot/retorno acotado, recogida según filtros actuales y Soul Shield existente únicamente si supera validación y exclusión. **No incorpora automáticamente pociones HP/MP, combos, otros buffs, reparación ni control de mascotas.** Mostrar ese alcance en Caza → Farmeo antes de iniciar. No prometer sostenibilidad desatendida: puede quedarse sin recursos o morir. HP/MP y espera deben estar visibles; una skill que requiere una política adicional no comprobada permanece no disponible. Añadir esas funciones sería otra ampliación explícita, no copiar la configuración de Home.

## 4. Recogida sin Home

Boot `Joe` (461903) procesa `world.pickupTarget`, valida pertenencia al mundo (`cR`), vivo/visible y solicita acercamiento cada `.4` s; al quedar a distancia Chebyshev entera ≤1 limpia el target y llama `pickupItemRequest`. El método del store (layout 4021749) genera el pedido; no exige Home. La aceptación, inventario, dueño del drop y distancia final son del servidor.

Propuesta para `ExcellentLoot`:

1. Recibir un contexto explícito de propietario y spot: Leveleo conserva su política; Farmeo exige sesión válida, mundo permitido, Home **apagado**, sin cast/retorno ni acción manual competidora. Un único pending y un único escritor de movimiento/recogida.
2. Mantener `matchesLoot`: Todo, Zen, Jewels/Gems, Ancient, Excellent, Kundun y coincidencias de nombre. Mantener Exigir Excellent/Luck solo para nombres. No reinterpretar nombres visuales como IDs.
3. En Leveleo conservar el diagnóstico de conflicto con filtros nativos. En Farmeo, con Home apagado confirmado, sus filtros almacenados no están ejecutándose: no exigir que estén todos deshabilitados ni que exista config binaria de Home para usar filtros del addon. Si Home vuelve a encenderse, pausar Farmeo y liberar sus acciones; no competir apagándolo repetidamente.
4. Centrar en el spot capturado, no en `route(400)`. Conservar rango de recogida 1–8 desde personaje, Zen adyacente y sin caminar. Limitar acercamientos al radio de Farmeo/camino completo; no perseguir un drop fuera del área. Kundun mantiene identificación/prioridad y rango desde personaje, pero no autoriza abandonar el área de Farmeo. Informar el límite, sin cambiar los filtros guardados.
5. Durante una recogida, suspender ataque/acercamiento y retorno al spot; después limpiar y devolver control al mismo propietario. Cancelar pending ante pausa, mapa/warp, muerte o identidad. Confirmar solo con los eventos correspondientes al item/money, conservar timeout de 15 s y reintentos/cooldown existentes. No dar por recogido un drop solo porque desaparece.

**Cristales:** no se verificó la identificación de los nuevos cristales como entidad de suelo/item. Textos de traducción, armas con «Crystal» y efectos de escenario no son prueba. No añadir categoría, ID ni promesa de recogida. «Todo» solo puede intentar entidades que ya exponga el cliente como `droppedItem` válido; tampoco demuestra que un cristal nuevo use ese mecanismo. Kundun actual sí tiene predicado explícito: group 14, num 11, lvl 8–12; aun así su aceptación real en este build requiere prueba posterior.

## 5. Catálogo de Aida/Kanturu y orden por familias

Fuente primaria: [definición pública 0.97d](https://mu.mormon.garden/assets/index-Da6Qw7tS.js), array `bo`, consumido como `gameVersion.data.moveList`. Boot `C8` usa esa lista y rellena `reqMaxLevel:400, gate:0`; **gate:0 es scaffolding de UI, no destino real**. `s7` envía `warpCommandRequest(J8[index]??index)`; `J8={42:37}` no altera 27–32.

| Nombre publicado | Alias publicado | Índice enviado por M | Nivel normal | MG/DL | Zen publicado |
| --- | --- | --- | --- | --- | --- |
| Aida | Aida | 27 | 140 | 92 | 8.500 |
| Aida 2 | Aida2 | 28 | 170 | 112 | 9.000 |
| Kanturu | Kanturu | 29 | 150 | 99 | 9.500 |
| Kanturu 2 | Kanturu2 | 30 | 150 | 99 | 10.000 |
| Kanturu 3 | Kanturu3 | 31 | 190 | 125 | 12.000 |
| Kanturu 4 | Kanturu4 | 32 | 210 | 138 | 15.000 |

Boot `Q8` (38519) aplica trunc(nivel×66/100) a BaseClass.MagicGladiator, DarkLord y RageFighter, salvo requisito 400. En Helper las clases comprobadas MG 12/13 y DL 16/17 usan mínimos reducidos. Rage Fighter no está habilitado en la definición 0.97d y no se agrega soporte incidental. Las demás clases conservan mínimo normal; no confundir BaseClass con `charClass`.

M también comprueba Zen y nivel de PK (`o<NM`); el catálogo no especifica otros requisitos de estas seis filas. No afirmar que el servidor carece de requisitos adicionales. Usar el índice verificado; el alias no prueba que `/move <alias>` esté admitido hoy. No añadir comandos fallback nuevos sin evidencia.

### IDs de mundo comprobados y límite pendiente

- Enum `P`: `WD_33AIDA=33`, `WD_37KANTURU_1ST=37`, `WD_38KANTURU_2ND=38`, `WD_39KANTURU_3RD=39`.
- Registro de mapas del layout: `AIe`/`RIe` → mundo 33, `BIe`/`zIe` → 37, `$Ae`/`UAe` → 38, `a2e`/`e2e` → 39. Son escenarios, **no las seis filas de M**. Por ejemplo, el escenario llamado `kanturu2` no prueba que el destino «Kanturu 2» de M vaya a 38.
- Spawns de escenario observados (85,10; 20,218; 76,105; 198,56) no son coordenadas demostradas de traslado ni spots recomendados. No usarlos para rellenar rutas.
- `Gate.bmd` 0.97d usa formato de 100 registros ×9 bytes. Se decodificó con XOR3 FC/CF/AB del parser actual; no contiene registros de mundos 33/37/38/39. No resuelve la asociación de las filas 27–32. No confundir índice de warp con gate o ID de mapa.
- Por tanto, la asociación individual **Aida/Aida2 → mundo/región** y **Kanturu/Kanturu2/3/4 → mundo/región**, llegada exacta y requisitos exclusivamente de servidor quedan pendientes. No se completaron por conocimiento de otros MU/OpenMU.

Política propuesta: reconocer para Farmeo los escenarios comprobados de familia Aida (33) y Kanturu de campo (37/38), siempre con build/protocolo validado, vivo, fuera de safezone y spot actual válido. Si no se conoce la variante, mostrar «Aida/Kanturu · variante de traslado no determinada», sin asignarle una fila de M. El 39 es escenario de evento y queda excluido del alcance inicial; una fila de M que resultara llevar allí queda no admitida para Farmeo hasta auditoría específica. Un warp a otra región del mismo mundo cancela por serial/evento, no solo por `mapIndex`. Esto permite diseñar activación **in situ** sin mentir sobre la variante de viaje.

Para habilitar los seis destinos en Leveleo se necesita una evidencia adicional de correspondencia (metadatos públicos del servidor vigente o una validación de viaje con autorización futura). Cada fila requiere `worldId` comprobado y, si comparte mundo, confirmación por warp serial/destino; no por proximidad imaginada. Si esa evidencia no existe, mostrarla no disponible con motivo y no enviar viaje. No declarar completo el incremento de rutas mientras falten esos datos.

### Orden y conservación de datos

Hoy `LEVEL_MAPS` (147), `WARP_INDEX`, `MG_MINIMUMS` tienen 26 entradas; Arena abre el catálogo y Arena 2–4 quedan separadas. Orden de presentación propuesto: Lorencia, Noria, Devias 1–4, Dungeon 1–3, **Arena, Arena 2, Arena 3, Arena 4**, Lost Tower 1–7, Atlans 1–3, Tarkan 1–2, Icarus, Aida/Aida2, Kanturu 1–4. Mantener los nombres publicados: «Arena» y «Kanturu», sin renombrarlos como datos persistidos.

Usar claves estables por destino y orden visual separado. No reordenar arrays guardados ni desempates de progresión de usuarios existentes. `MapVisit.choose` y `renderMapPlan` dependen del orden; cubrirlo expresamente. Revisar límites de 26 pasos/UI sin convertirlos automáticamente en una obligación de usar los 32 destinos.

**Migración necesaria:** `validLeveling` (186+) exige `maps.length===LEVEL_MAPS.length`; agregar seis entradas sin adaptación invalidaría todos los perfiles de 26 mapas. Aceptar el formato histórico válido, preparar seis filas nuevas deshabilitadas/sin spots en borrador y normalizar por ID, conservando niveles/spots/orden y todos los campos originales. Abrir/Cancelar no escribe. Guardar aplica bajo la transacción por cuenta; rollback restaura bytes/base anteriores. Datos corruptos o IDs desconocidos se conservan para recuperación, no se convierten silenciosamente. La migración debe funcionar también para perfiles con `leveling` que hoy se devuelven sin cambios en `migrateLeveling`.

## 6. Estados, prioridades y controles

Una intención principal `running` conserva el contrato; un modo interno `leveling | farming | resetting` y un propietario `none | principal | balrog` resuelven ejecución. Estados propuestos de Farmeo: `validating`, `waiting-home-off`, `farming`, `waiting-resources`, `looting`, `returning`, `stopping`, `paused/blocked`. No son nuevos timers.

| Situación al pedir Play/F10 o en transición activa | Resultado propuesto |
| --- | --- |
| Principal activo, cualquier modo | Pausa primero. No convierte una pulsación de pausa en inicio de otro modo. |
| Balrog activo y F10/Play principal | Detener Balrog y liberar acciones; no iniciar otro motor en la misma pulsación. Próximo Play explícito elige modo. Mantener el control propio existente de Balrog, sin crear controles nuevos de Farmeo. |
| Nivel <400 | Leveleo existente; conserva ruta y requisitos. |
| Nivel 400, `autoReset!==false` | Reset existente/reingreso; prioridad sobre Farmeo. No pedir Home para atacar. |
| Nivel 400, reset apagado, mundo admitido y capacidades completas | Capturar spot de posición actual, validar skill/identidad, detener Home si lo controlaba el ciclo y esperar confirmación; iniciar Farmeo. No viajar por la ruta. |
| Llega a 400 durante Leveleo, reset apagado y mapa admitido | Misma transición automática, antes de buff/loot/selección de nueva etapa. Cancelar acciones no enviadas de ruta; no necesitar otro Play. |
| Nivel 400/reset apagado, otro mapa o capacidad insuficiente | Pausado/no disponible con motivo concreto: mapa, build, skill, recursos de lectura o cancelación. Nunca insistir con Home ni viajar automáticamente a Aida/Kanturu. |
| Se enciende reset automático durante Farmeo | Cambio de intención explícito: detener Farmeo, liberar acciones, luego reset si el ciclo sigue activo y horario válido. Un ciclo pausado no arranca por guardar preferencias. |
| Se apaga reset con `/reset` aún en cola | Cancelar lo no enviado y reevaluar modo. Enviado: esperar confirmación o fallo; no iniciar Farmeo simultáneamente. |
| Se solicita Balrog a 400 con su combate actual dependiente de Home | Rechazar antes de viaje/preempción con diagnóstico. No agregar combate manual para Balrog incidentalmente. |
| Balrog compatible iniciado explícitamente | Preempta al principal, limpia acciones y lo deja pausado; finalizar/pausar Balrog no reanuda Leveleo ni Farmeo. |

Orden de arbitraje en cada refresh: (1) pausa/identidad/muerte/desconexión/cambio de mundo y fin de horario; (2) confirmación de reset/warp ya enviados y limpieza; (3) dueño Balrog válido; (4) reset elegible; (5) transición/resolución del principal; (6) una sola acción de buff compatible, loot, retorno o ataque. No ejecutar `Cycle.step` y el paso de Farmeo en la misma evaluación. Generación de sesión en cada acción; revalidar justo antes de despachar, incluso tras esperas de Home y promesas de horario.

Si un warp de Leveleo ya fue enviado cuando llega a 400, no se puede retirar: limpiar intenciones restantes y esperar llegada; después reevaluar mundo y capturar spot solo si sigue admitido. Sin confirmación, pausar. No usar la ubicación transitoria como spot ni enviar otro viaje/reset.

### Spot, intervención manual y cancelaciones

- Al activar o pasar automáticamente a Farmeo, capturar `x=transform.pos.x`, `y=transform.pos.z`, mundo, héroe, cuenta/personaje/servidor/clase y serial de warp. La ubicación es operativa de esa sesión, no reemplaza spots de Leveleo guardados. Nueva activación tras pausa captura ubicación nueva.
- Solo objetivos dentro del área del spot (radio configurado de Farmeo, propuesta 1–8, inicial 8) y trayectoria completa dentro del área. Usar alcance de cada acción; no confundir radio de búsqueda con distancia de golpe. No explorar mapa ni resetear ni avanzar etapas. Objetivo perdido/muerto → soltar y buscar otro, sin persecución fuera del área.
- Retorno solo cuando no hay combate/recogida/manual pendiente, por camino validado. Progreso limitado: tras 45 s sin avance, pausar con diagnóstico. No mover por coordenadas ficticias ni por ausencia de enemigos.
- Pausa manual: cancelar cola no enviada y pending de recogida/buff/target/cast propios, aproximación y callback diferido comprobado. Restaurar skill anterior solo si sigue seleccionada la propia; no restaurar sobre una selección manual nueva. Pausa no deshace paquetes ya enviados.
- Muerte: cancelar sesión, descartar spot operativo y quedar pausado; reaparecer no reanuda ni camina al cadáver. Cambio de mapa, warp dentro del mismo mapa, recreación de mundo/héroe, desconexión o cambio de identidad: mismo resultado; no reanudar al volver/reconectar.
- Intervención manual en movimiento/objetivo/casteo/recogida: ceder y pausar Farmeo, sin borrar la acción del jugador. No tratar un nuevo objeto con el mismo netId como el objetivo anterior.
- Recarga/pagehide destruye sesión y listeners propios. Un callback tardío con generación vencida no puede actuar. Una solicitud enviada puede terminar en el servidor; informar esa incertidumbre, sin reenvío.
- Si el adaptador no permite cancelar con propiedad suficiente una acción de ataque básico o skill diferida, bloquear esa capacidad. No prometer «cero acciones después de pausa» solo por vaciar referencias históricas.

### Programación horaria

Conservar la política de `docs/daily-schedule.md`: hora IANA Argentina, inicio incluido/fin excluido, medianoche, Web Locks/lease, pausa/fallo por ocurrencia y otra pestaña. F10/Play respetan la franja cuando está habilitada. El reloj llama al mismo resolver de modo: puede empezar Leveleo/reset/Farmeo según nivel y condiciones, sin botones alternativos.

Farmeo hereda el control manual/programado de la sesión de Leveleo durante la transición a 400. Fin de horario pausa también Farmeo y limpia acciones propias; deshabilitar horario detiene lo programado, conserva lo iniciado manualmente conforme a la política vigente. Un inicio no disponible a 400 consume un fallo por ocurrencia cuando la incompatibilidad es definitiva; loading/confirmaciones transitorias solo esperan. No reintentar fallos cada 500 ms.

Muerte, warp manual o intervención manual durante Farmeo registran inhibición de la ocurrencia además de limpiar el runtime; la programación no puede reiniciarlo al siguiente tick. Otra pulsación explícita dentro de franja puede levantar esa inhibición usando el mecanismo existente. Cambiar de cuenta/personaje/desconectar conserva cancelación y protección de identidad actuales. Balrog explícito inhibe al principal el resto de la ocurrencia y sigue siendo independiente del fin horario, como hoy.

**Recarga:** conservar recuperación programada existente para Leveleo; para Farmeo cancelado no recapturar automáticamente un spot nuevo tras recarga dentro de la misma ocurrencia. Persistir la inhibición usando el registro operativo existente (sin guardar el spot como preferencia). La transición a Farmeo debe dejar registrada esta política antes de actuar; la próxima ocurrencia habilitada podrá iniciar en la ubicación válida de entonces. Si falla persistencia, mantener bloqueo local y mostrar que no puede garantizarse tras cerrar la pestaña. No prometer ejecución con pestaña congelada/equipo dormido.

### Presentación y datos

Estado principal: **«Farmeando»**, acompañado de mapa/spot, espera o causa de bloqueo; `aria-pressed` y `running` reflejan intención activa incluso mientras espera recursos/loot. Caza → Farmeo reúne skill, radio, alcance de soporte y diagnóstico, sin Play adicional, tecla o armado independiente. El mismo texto debe llegar a mini control, HUB y cabecera externa; no dejar «Leveleando» en un consumidor.

Preferencia propuesta opcional `farm:{version:1,skillMode:'selected'|'explicit',skillNumber:null|entero,radius:entero}` dentro del perfil v1 existente. Ausente equivale a selección actual/radio 8; no implica Play activo. Validación, lectura/guardado, importación y rollback deben preservar el campo; no persistir target, spot operativo ni `running`. No habilitar capacidades desconocidas por valores antiguos.

## 7. Selector buscable: formulario único y proyección

Propuesta: combobox editable en el host canónico del editor de mapas, con input de búsqueda y lista de opciones por familia. Mantener el valor comprometido `selectedLevelMap` separado de consulta y opción enfocada. Filtrar por nombre/alias normalizados (sin distinción de mayúsculas/acentos y tolerando espacios); búsqueda vacía muestra todo en orden familiar. «Kanturu» muestra las cuatro filas, «Arena» las cuatro juntas. Conservar indicadores textuales «activo»/«incompleto», aunque el mapa seleccionado quede fuera del filtro. Sin resultados no cambiar selección ni crear mapa.

- Escribir filtra; flechas arriba/abajo recorren coincidencias y desplazan la opción visible; Enter confirma solo la opción enfocada, captura primero el borrador del mapa anterior y ejecuta la misma selección canónica. Clic confirma por ID, sin cambiar enabled ni iniciar juego. Tab sale sin confirmación implícita.
- Escape con lista abierta cierra/restaura consulta a la selección vigente y consume el evento; un segundo Escape sigue el cierre/Cancelar actual de Config. No cerrar toda Config al querer cerrar el selector. Ignorar Enter durante composición IME. F10 mantiene exclusión de campos editables/repeticiones/modificadores.
- Usar `role=combobox`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `role=listbox/option`, `aria-selected` y un estado de resultados. Para que las opciones sean accionables por el puente actual, representarlas con controles serializables permitidos (por ejemplo botones con rol option), sin ampliar eventos a cualquier nodo del juego.
- `page-bridge.js` hoy solo reenvía keydown Enter para `input.new-name`; `renderer.js` tiene la misma limitación. Agregar una lista cerrada ArrowUp/ArrowDown/Enter/Escape **solo** al input canónico marcado del selector, con sesión/lease/nodo vigente. No forwarding genérico de teclado ni selectores arbitrarios. Añadir `isComposing` validado si se transporta, o evitar envío durante composición en el renderer.
- La lista/filtrado viven en Helper. Renderer no vuelve a filtrar ni mantiene catálogo/formulario propio; solo conserva texto/foco/selección y refleja cambios del host. Preservar cola/ack/editToken para que un polling tardío no reemplace la consulta ni pierda la flecha/Enter. No reenviar por timeout una selección incierta.
- Los IDs de nodos serializados son opacos; `aria-controls`/`aria-activedescendant` que referencian IDs DOM deben remapearse dentro de la proyección o quedar coherentes con IDs únicos conservados. Comprobarlo con lector/árbol accesible en las dos interfaces; no alcanza con que los atributos pasen la allowlist.
- Mantener lista dentro del viewport, con scroll y targets táctiles; ajustar CSS de las dos presentaciones. No usar un portal fuera del host que desaparezca de la serialización. Actualizar selectores CSS del grid externo que hoy esperan `.map-select`/`label`.

El editor legacy recuperable puede conservar su select nativo con el mismo catálogo/orden; no clonar el nuevo editor en él. Si se agrega búsqueda al legacy después, reutilizar el mismo controlador, no otra implementación. El requisito de búsqueda de esta entrega corresponde al selector principal de mapas original y su proyección externa.

## 8. Plan de implementación posterior por entregables

Nada de esta sección se ejecuta en esta etapa. Las casillas son trabajo futuro; cada bloque tiene un resultado verificable. Revalidar build y estado ajeno antes de editar. No hacer commits/releases de archivos de otros trabajos.

### A. Adaptador manual y puertas de compatibilidad

**Archivos:** `src/helper/level-helper.user.js` (adaptador acotado y decisiones puras); `tests/farming.test.cjs` y `tests/fixtures/farming-client-audited.cjs` nuevos; `demos/helper/farming-client-audited.js` nuevo solo si la suite UI lo necesita. `src/extension/page-bridge.js` solo si hace falta exponer disponibilidad del build, nunca un motor.

- [ ] Extraer cuerpos exactos de `qzt`, `V0e`, requisitos, predicados y cancelación de los assets con hash verificado. Mantener dependencias reales extraídas separadas de stubs de UI/red; registrar lo sustituido. No copiar un motor completo al addon.
- [ ] Definir adaptador interno que describa capacidades por skill/equipo y devuelva diagnóstico, alcance, disponibilidad/recursos y estrategia de cancelación. Consumir singletons ya cargados (`n`, `aA`, `az`, `ll`, según el build auditado) mediante validaciones explícitas; no importar boot ni abrir sockets.
- [ ] Probar Home apagado/nivel 400, desconocido/par incompleto, objetivo monstruo/NPC/jugador/invocación/muerto/obsoleto, mapa incompatible, arma/munición, recursos y cooldown. Cerrar acceso ante datos ausentes, sin fallback aproximado.
- [ ] Reproducir callback básico después de limpiar target y comprobar que cancelación propia lo impide; intervención manual nueva no se borra. Probar pausa durante carga, ráfaga y desplazamiento diferido para cada skill que se quiera admitir. Excluir explícitamente las no demostradas.

**Puerta:** ninguna skill/ataque queda «admitido» sin esas pruebas; no basta conectar store/world. Si no se puede garantizar propiedad/cancelación, entregar diagnóstico y capacidad bloqueada.

### B. Modo principal, transición y exclusión

**Archivos:** `src/helper/level-helper.user.js` (`Cycle`, resolver, refresh, `enact/serviceHelper`, limpieza, F10, render, schedule/Balrog); `tests/farming.test.cjs`, `tests/farming-ui.cjs` nuevos; regresiones en `tests/helper.test.cjs`, `tests/helper-ui.cjs`, `tests/helper-arrival.test.cjs`, `tests/helper-arrival-ui.cjs`, `tests/schedule.test.cjs`, `tests/schedule-ui.cjs`, `tests/balrog.test.cjs` y `tests/balrog-ui.cjs` existentes.

- [ ] Escribir tabla de casos del apartado 6 como pruebas del mismo resolver para las tres entradas de Play y reloj. Separar configuración válida de ruta utilizable: Farmeo a 400 no debe depender de tener mapas de Leveleo habilitados; conservar protección de datos corruptos.
- [ ] Incorporar sesión de Farmeo y spot, transición 399→400 antes de ruta/buff/loot y exclusión con reset/warp. Una sola cola, propietario y refresh. Probar reset ON/OFF, cambio durante ejecución y solicitudes ya enviadas.
- [ ] Integrar selección de skill fijada y limpieza; comprobar muerte/respawn, warp al mismo mundo, desconexión/reconexión, identidad/clase/servidor, héroe recreado, pagehide, target reemplazado y callbacks tardíos. Ninguno reanuda implícitamente.
- [ ] Ajustar Balrog con preflight a 400, preempción explícita e inhibición horaria; comprobar que un inicio rechazado no quite el Farmeo válido y que F10 con Balrog activo primero pause sin iniciar otro modo.
- [ ] Extender DailySchedule sin cambiar claves/lease: fin exacto, medianoche, pausa recargada, dos pestañas, fallo persistente, editar/deshabilitar horario, fallo de storage y Farmeo cancelado tras recarga. Simular suspensión y no reproducir ticks/franjas perdidas.

**Puerta:** ni un tick emite combate/loot/retorno de dos propietarios; apagar Play limpia acciones propias y no reinicia por reloj en la misma ocurrencia.

### C. Recogida y soporte acotado

**Archivos:** `src/helper/level-helper.user.js` (`ExcellentLoot`, conflicto, centro/rango, SoulShield, propiedad); `tests/excellent-loot.test.cjs`, `tests/excellent-loot-ui.cjs`, `tests/route-loot.test.cjs`, `tests/route-loot-ui.cjs`, `tests/kundun-loot.test.cjs`, `tests/kundun-loot-ui.cjs`, nuevos casos de Farmeo.

- [ ] Sustituir la condición Home-activo por el contexto explícito del modo, conservando exactamente la política anterior para Leveleo. Home apagado con filtros almacenados ON o config ausente no bloquea el picker de Farmeo; encendido inesperado pausa.
- [ ] Comprobar categorías combinadas, lista normalizada y requisitos Excellent/Luck, Zen adyacente sin movimiento, dueño/rechazo/inventario lleno, path bloqueado, pendientes y confirmaciones. Un cristal desconocido no se identifica por coincidencia visual.
- [ ] Comprobar loot contra ataque/buff/retorno, límite del spot y Kundun prioritario sin fuga del área, timeout y cancelación por warp/muerte/pausa. Ninguna confirmación tardía avanza una sesión nueva.
- [ ] Revalidar SoulShield con `usability`, buff confirmado y restauración condicional de skill. Su falta de aprendizaje no bloquea clases que no lo usan; no lanzar skills de soporte como ataque. No copiar pociones históricas.

### D. Catálogo, migración y búsqueda en ambas interfaces

**Archivos:** `src/helper/level-helper.user.js` (`LEVEL_MAPS`, `WARP_INDEX`, mínimos, normalización/validadores, editor/transacciones); `src/extension/renderer.js`, `src/extension/page-bridge.js`; `tests/map-leveling.test.cjs`, `tests/map-leveling-ui.cjs`, `tests/mg-minimums.test.cjs`, `tests/account-settings-ui.cjs`, `tests/extension-panel-ui.cjs` y, si hace falta aislar el teclado, `tests/map-search.test.cjs` nuevo.

- [ ] Completar evidencia destino→mundo/región por fila 27–32 y requisitos vigentes antes de habilitar viajes. Añadir seis filas sin comandos/coordenadas supuestos; las capacidades pendientes se muestran bloqueadas. Probar que un escenario de Kanturu no se identifica como una variante solo por nombre del asset.
- [ ] Adaptar validación de mapas de 26 entradas y migración de rutas; preservar bytes hasta Guardar. Casos: perfil de 26, nuevo de 32, campos desconocidos, duplicados/corruptos, cambio de cuenta, recuperación legacy y rollback tras fallo. Nuevos mapas apagados/sin spots. No modificar desempates de visitas al ordenar la UI.
- [ ] Crear controlador canónico del combobox y añadir teclado acotado al transporte. Probar búsquedas con tildes/espacios, Arena agrupada, cero resultados, indicador activo/incompleto, flechas, Enter, Escape en dos niveles, Tab, clic y composición.
- [ ] En interfaz original y panel externo probar editar coordenadas→buscar otro mapa→volver, Guardar/Cancelar/rollback, filtro sin escritura de enabled, polling con input enfocado, revisión/nodo retirado, sesión vencida, pérdida de conexión y Enter duplicado. Comprobar foco y referencias ARIA reales, móvil/viewport corto y scroll.

### E. Ajustes, estado y validación integral

**Archivos:** `src/helper/level-helper.user.js` (settingsProvider/lectura/persistencia); `src/extension/panel.js` (descripción de Caza y texto principal); `src/hub/hub.user.js` solo si su presentación actual no refleja `getState` completo; suites existentes `tests/helper-ui.cjs`, `tests/extension-ui.cjs`, `tests/extension-panel-ui.cjs`, pruebas de aislamiento/Config; `scripts/test-ui.cjs` para registrar nuevas suites; documentación de uso/diseño/rutas/programación y changelog únicamente al implementar contenido publicable.

- [ ] Caza → Farmeo muestra selección, radio y limitaciones sin segundo inicio. Guardar no activa Play ni reanuda pausa; Cancelar y rollback preservan switches inmediatos ya confirmados según su política actual. Perfil por cuenta intacto.
- [ ] Verificar «Farmeando»/esperas/bloqueos, intención y `aria-pressed` en juego, standalone, HUB y panel. F10 ignora repetición/modificadores/composición/campos. Conectar/desconectar panel no cambia Play. Golden hunt sigue retirado.
- [ ] Ejecutar al implementar `npm.cmd run check`, `npm.cmd test` y las suites UI pertinentes mediante runtime aislado existente. Luego las obligatorias de `scripts/test-ui.cjs` cuando corresponda a una entrega ejecutable. Await de todos los procesos; no declarar éxito por output parcial. No ejecutar release como parte de este plan.
- [ ] Caso integrado mínimo: fixtures nivel 399/Home permitido → nivel 400/reset OFF/mundo admitido → Home OFF confirmado → skill válida/casteo/loot → Pausa, sin rutas/reset nuevos. Repetir reset ON, mundo no admitido y skill incompatible; registrar cada solicitud y confirmar exclusión/cancelación.

## 9. Hechos, hipótesis y pendientes de aceptación

**Comprobado ahora:** build/hash; bloqueo Home 400; caminos manuales separados y sus condiciones estáticas; seis filas de traslado con nombres/alias/índice/nivel/Zen; enums/registros de escenarios; falta de destinos nuevos en Helper; requisito Home del picker actual; Golden hunt inerte; transporte de teclado insuficiente; dependencia rígida de 26 mapas; tres comprobaciones locales extraídas (Home, requisitos de skill y callback de ataque).

**Hipótesis de diseño, no funciones existentes:** política de Farmeo in situ en mundos 33/37/38; adaptador de capacidades; skill fijada al iniciar; recogida con Home apagado; inhibición de recarga de Farmeo; combobox y su transporte. Requieren implementación y pruebas. No se agregaron aún a allowlists ni preferencias.

**Pendientes que impiden afirmar compatibilidad completa:** asociación individual de seis traslados con mundo/región y requisitos exclusivos de servidor; aceptación real de ataque/casteo/loot a 400; clases/skills concretas cuya cancelación quede demostrada; identificación de cristales nuevos. Mantener diagnósticos específicos, no sustituirlos con una promesa general.

**Límites:** fixtures prueban decisiones/propiedad, orden de callbacks y traducción de solicitudes con las dependencias sustituidas que se declaren. No prueban daño, tasas efectivas, drops, spawns, pathfinding real con colisiones, condiciones de red/servidor, protección antiabuso ni funcionamiento con una cuenta. No se ejecutó la suite completa del proyecto por una nota documental y no se generaron capturas nuevas. La validación real requeriría autorización separada y debe observar solicitudes, confirmaciones y cancelación sin alterar Home ni insistir ante rechazos.

El resultado de esta etapa es este informe y plan. Las puertas abiertas están identificadas; no hay implementación ni releases.
