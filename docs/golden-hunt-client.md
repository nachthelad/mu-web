# Estado vigente: Golden hunt retirado (2026-10-11)

Helper 1.24.2 / HUB 1.4.7 retiran la cacería publicada y sus controles. actions.gold responde available:false y getState().gold.ready es false. Preferencias y clases históricas se conservan inertes, sin listener reactivo ni entrada de activación. El contador informativo de Radar continúa activo durante invasiones. Las referencias siguientes a cacería describen el diseño histórico, no instrucciones de uso vigentes.

# Interfaces verificadas para Golden hunt

## Contador flotante · verificación pública 2026-10-10

Revisado sin cuenta el cliente actual: index-DQoUdcHM.js referencia boot-BuVoDwBX.js. Su fila dorada conserva `.event-row`, `.event-row-label` y `.event-row-clock`; `title` se construye como `nombre: alive`, separado por saltos de línea. El total se toma de InvasionMonsters (status byte 3, total uint16 BE byte 4, count byte 6, filas map/alive desde byte 7). El overlay Radar 1.9.0 reutiliza este lector, sin hover ni deducción desde avistamientos. Esta inspección confirma la estructura pública, no una invasión real ni la instalación del usuario.

## Invasión activa al cargar · 2026-10-07

Reverificado el bundle público boot-Cdj0FSwZ.js: el title de la fila se construye con mapas/cantidades solo mientras la invasión está activa y el clock muestra «N left» o «Active». Radar antes solo interpretaba clocks numéricos: al perder los paquetes iniciales, ignoraba ese HUD vigente. La nueva lectura recupera el evento sin hover ni avistamientos históricos; la transición a un clock numérico cierra la invasión recuperada. Prueba local reproduce la carga tardía, no el estado instalado del usuario.

[Gates.cs upstream](https://github.com/MUnique/OpenMU/blob/master/src/Persistence/Initialization/VersionSeasonSix/Gates.cs) asocia Noria con mapa 3, warp 3, gate 27 y región 171–177 / 108–117. Centro utilizado: 174/112; los requisitos reales siguen sujetos a la respuesta del servidor. Noria se agrega opcionalmente a la ruta de Goldens.

## Timer, mapas restantes y Soul Shield · 2026-10-07

Inspección read-only del [cliente desplegado](https://mu.mormon.garden/assets/boot-Cdj0FSwZ.js), sin cuenta: Golden Invasion es la última fila del HUD `.event-timers`; label y clock son spans con texto. El tooltip `title` enumera nombres de mapa y cantidades, construido desde InvasionMonsters, sin depender del hover. Helper no reproduce la fórmula de horario local del cliente: Radar lee el contador mostrado y conserva la identidad entre esa preparación y la señal del evento.

El listener InvasionMonsters del cliente lee status en offset 3 (Active=1, Defeated=2), total uint16 BE en 4, cantidad de mapas en 6 y filas de tres bytes desde 7: map uint8, alive uint16 BE. Radar exige todas las filas completas, conserva timestamp/evento y limpia al desconectar. Helper omite únicamente ceros explícitos y frescos (60 segundos), después del loot pendiente. La versión desplegada contiene esta ampliación aunque el componente upstream consultado aún muestra solo los tres eventos tradicionales.

[skillsDatabase.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/common/skillsDatabase.ts) identifica Soul Barrier (Soul Shield en la interfaz del addon) como skill 16, SM/Grand Master, 70 mana y 22 AG. [loop.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/muHelper/loop.ts) asocia Soul Barrier con efecto 4 y usa selectSkill + castRequest sobre el héroe. No hay flag useBuff: basta un slot positivo en config.buffs. [buffs.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/skills/buffs.ts) confirma Store.buffs como efectos vigentes. Se comprueba skill aprendida y efecto presente; los casts propios esperan confirmación, no simulan éxito. Sin recursos/skill/confirmación se avisa y continúa. Pruebas simuladas no confirman comportamiento del servidor real.

## Zen sin moverse · Helper 1.13.1

[ItemPickupSystem](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/ecs/systems/itemPickupSystem.ts), revisado el 2026-10-07, usa Math.max(abs(trunc(drop.x)-trunc(hero.x)), abs(trunc(drop.z)-trunc(hero.z))) <= 1 para recoger sin aproximación. Helper comprueba ese alcance para dinero y llama Store.pickupItemRequest(netId) directamente, sin escribir pickupTarget, playerMoveTo ni pathfinding. El Zen lejano no se solicita, incluso con Todo/rango 8. Conserva respuesta InventoryMoneyUpdate, cooldown y validación del servidor; no interrumpe movimientos de combate ni manuales. Pruebas locales verifican casillas/diagonales/decimales, no modificar caminos, y no borrar targets manuales al cancelar. No confirma recogida real.

## Ruta y Obtener · Helper 1.13.0 / Config 1.1.0

Revisión pública sin cuenta del 2026-10-07. El [cliente desplegado](https://mu.mormon.garden/) carga index-Dyb2X64p.js, layout-DFCVGNpE.js e index-oPamF5e1.js. Este último contiene el catálogo v097d de 26 destinos, índices 1–26, alias y mínimos que coinciden con la captura. Arena usa índice 1/alias Stadium; Arena 2/3/4 usan 24/25/26. Tarkan muestra 8000 Zen en esa tabla pública y 7000 en la captura; la interfaz del addon mantiene la referencia entregada por el usuario, no verifica costos de sesión. El catálogo es una instantánea local, no lectura dinámica de M.

[MoveCommandWindow](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/ui/pages/worldPage/components/moveCommandWindow/index.tsx) corrobora `Store.warpCommandRequest(index)`. Helper lo prefiere para las rutas nuevas y mantiene `/move` como alternativa; no arma paquetes. Variantes de igual mapa requieren incremento de warpSerial. Un mínimo precargado es conservador: no se reduce por clase ni se aprende automáticamente del servidor en esta ruta de leveleo.

[itemStats.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/common/itemStats.ts) define jewels por grupo/número: Chaos 12/15 y grupo 14 números 13,14,16,22,31,41,42,43,44. Excellent y Ancient requieren booleanos del item; Zen requiere isMoney. Categorías OR, nombres con condiciones AND. El nuevo picker exige apagar todos los filtros nativos para evitar competencia, conserva combate/pociones de Home y no modifica su blob ni su estado privado. InventoryMoneyUpdate C1/C3 22 FE confirma Zen y ItemAddedToInventory confirma equipo; ambas respuestas carecen de ID del drop y conservan la limitación de asociación simultánea. Home mantiene su reparación configurada, que no se duplica en Obtener.

Config minimiza solo presentación y conserva la transacción de edición. Helper conserva motores/scheduler/claves v1; HUB y Radar no necesitan cambios. Pruebas de ruta/categorías, API nativa de warp, orden Home/warp, confirmación de Zen, rollback y nueve suites UI en demos. No se probó una ruta real ni se instalaron scripts.

## Loot de equipo opcional · Helper 1.12.0

Revisión pública del cliente el 2026-10-05, sin cuenta real. [loop.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/muHelper/loop.ts) combina `pickExcellent`, `pickAncient`, `pickExtraItems` y `pickAllItems` con OR; nombres no restringen categorías y no existe filtro de Luck. [config.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/muHelper/config.ts) define el blob: byte 1, bits 4/5/7 para Ancient/Excellent/nombres; byte 27 bit 6 para Todo; byte 2 nibble alto para obtainRange. Zen/jewels son byte 1 bits 6/3. [state.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/muHelper/state.ts) confirma que `Store.muHelper.config` es un blob y el loop usa un estado decodificado aparte: no modificar el blob ni inventar un objeto de configuración nativo.

[itemSerializer.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/common/itemSerializer.ts) expone `isExcellent` y `luck` como booleanos reales; [logic.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/logic.ts) conserva el nombre de drop en `objectNameInWorld`. El addon usa ese nombre solo para coincidencia textual y exige los dos booleanos. Mantiene el camino nativo de `pickupTarget` y limita rango a Home/radio del spot. Pausa el ciclo ante filtros amplios en el siguiente refresh; no garantiza bloquear un pickup nativo que ya fue enviado o un cambio de Home entre refreshes. Home usado por separado conserva sus propios filtros. Confirmación de inventario tiene la misma limitación de asociación sin ID de drop documentada para Kundun. Ocho suites UI y pruebas puras validan demos; no confirman la versión desplegada ni recogidas reales.

## Mejora reactiva (Radar 1.4.1 / Helper 1.10.1)

Radar publica su snapshot live/recent y notifica después de cada scan (250 ms). Helper decide en ese mismo turno; conserva refresh de 500 ms para el resto de su motor. Demo controlada: 199 ms desde aparición hasta ataque seleccionado y 0 ms adicionales desde notificación. No garantiza latencia de red ni daño instantáneo en partida.

Un dorado vivo del mapa no se excluye por las regiones aproximadas de patrulla. Las marcas recientes se buscan durante hasta cinco segundos, solo si tienen menos de diez segundos; no se atacan entidades desaparecidas. El historial sigue guiando patrulla.

[monsters.json](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/common/monsters.json) verifica niveles de tipos 43/44/53/54/78/79/80/81/82/83: 15/60/53/46/20/80/83/61/90/77. La prioridad usa números, no los nombres traducidos (80/81 aparecen con nombres discrepantes en fuentes), ni el ID como nivel. Los tipos avanzados sin nivel en ese catálogo quedan sin rango conocido. Configuración personalizada del servidor puede diferir. Ruta de mapas: Tarkan (90), Atlans (83), Lorencia (60), Davias (53); dentro de Atlans se entra primero por Atlans3. Requisitos de entrada siguen aprendidos del servidor.

[ServerToClientPackets.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/common/packets/ServerToClientPackets.ts) verifica ObjectGotKilled C1 17, longitud 9: KilledId uint16 BE desde 3, KillerId desde 7. Cuenta solo KillerId del personaje y entidad dorada observada en el mapa actual; WeakSet deduplica el encuentro sin confundir reutilización de netId. `dying.killedByHero` es la alternativa del estado confirmado del cliente. ObjectHit C1 11 (10 bytes, ID BE desde 3/daño desde 5) y ObjectHitExtended (16 bytes, ID LE desde 4/daño uint32 LE desde 8) confirman progreso de daño, nunca muerte.

[skillCastSystem.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/ecs/systems/skillCastSystem.ts) sirve castRequest, acerca usando el alcance de la skill y lo limpia después del cast. Helper conserva la solicitud pendiente. AttackSystem exige worldIndex para básico: si falta y no hay skill aprendida, se pausa con explicación; no se altera la entidad para inventar mapa.

Cinco kills propias por mapa/evento hacen salir después de esperar el drop acotadamente y confirmar Kundun pendiente. Atlans2 y Atlans3 comparten cuota. Máximo cinco minutos por destino cuando no se alcanza la cuota. HUB 1.2.1 queda compatible y sin cambios.

Revisión de código público el 2026-10-04. Corrobora interfaces upstream; no demuestra que la configuración ni la versión desplegada del juego sean idénticas. No se accedió a una cuenta.

## Evento

[InvasionConfigurationDefaults.cs](https://github.com/MUnique/OpenMU/blob/master/src/GameLogic/PlugIns/InvasionEvents/InvasionConfigurationDefaults.cs) define Golden Invasion con aviso inicial, fin y tres segundos de anticipación. [BaseInvasionPlugIn.cs](https://github.com/MUnique/OpenMU/blob/master/src/GameLogic/PlugIns/InvasionEvents/BaseInvasionPlugIn.cs) emite el aviso a los jugadores. La configuración predeterminada dice `Golden invasion!` y `Golden invasion has ended.`; se reconocen también preavisos explícitos en inglés/español. No se supone un horario de cuatro horas para el servidor real.

[invasion.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/events/invasion.ts) documenta que MapEventState evento 3 corresponde a Golden Dragon y es local al mapa. El estado puede apagarse o limpiarse al trasladarse. Golden hunt no interpreta esa limpieza como final global ni comienza otra ruta cada vez que llega a un mapa. [ServerToClientPackets.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/common/packets/ServerToClientPackets.ts) define ServerMessage C1 0D: tipo en byte 3 y texto desde byte 4. Solo tipo 0 dispara avisos; mensajes de derrota de un monstruo no son señal global de inicio/fin.

Sin un aviso reconocible, G espera la confirmación MapEventState; si no llega ninguna señal, no adivina el comienzo. Los avisos configurados con otro idioma o redacción pueden necesitar ampliar el reconocedor. La sesión tiene límite de 35 minutos; no prueba la duración real del servidor.

## Traslados y requisitos

[Gates.cs](https://github.com/MUnique/OpenMU/blob/master/src/Persistence/Initialization/VersionSeasonSix/Gates.cs), [moveReqFile.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/libs/mu/moveReqFile.ts) y las tablas `Data/Local/Eng/MoveReq_eng.bmd` / `Data/gate.bmd` corroboran destinos:

| Destino | Comando | Mapa | Centro del gate | Nivel base upstream |
| --- | --- | --- | --- | --- |
| Tarkan2 | `/move tarkan2` | 8 | 98,145 | 140 |
| Atlans2 | `/move atlans2` | 7 | 227,52 | 80 |
| Atlans3 | `/move atlans3` | 7 | 65,160 | 90 |
| Lorencia | `/move lorencia` | 0 | 142,126 | 10 |
| Davias (Devias en cliente) | `/move devias` | 2 | 207,42 | 20 |

Estos niveles son referencia upstream; no se precargan como requisitos confirmados del servidor. [WarpAction.cs](https://github.com/MUnique/OpenMU/blob/master/src/GameLogic/PlayerActions/WarpAction.cs) responde con un nivel efectivo cuando falta nivel. Golden hunt correlaciona el rechazo con el comando enviado y aprende ese número por personaje/clase y servidor. Viaje exitoso, rechazo por zen/PK y timeout no producen un mínimo inventado.

Se exige un MapChanged posterior al comando y el mapa/región esperados; Atlans2/3 comparten ID. Las regiones de patrulla se aproximan por proximidad a los centros de gates, incluyendo Atlans/Tarkan base para no asignarles automáticamente todo el mapa a las variantes. Esta partición es una heurística de navegación, no una frontera definida por el servidor. Los spots se agrupan por coordenadas y se conservan intactos. Se revisan terreno, zonas seguras y, cuando existe, `world.pathfinder.search(from,to,{closest:false})`; puntos sin camino se omiten.

## Combate y loot

[loop.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/muHelper/loop.ts) y [world.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/ecs/world.ts) corroboran `attackTarget`, `castRequest={target,point}`, `pickupTarget` y `playerMoveTo`. [AttackSystem](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/ecs/systems/attackSystem.ts) y [ItemPickupSystem](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/ecs/systems/itemPickupSystem.ts) conservan los mismos caminos que el input manual. Golden hunt mantiene Home apagado para que no seleccione enemigos comunes o compita con la patrulla. Usa la primera skill aprendida configurada en Home o ataque básico; respeta pociones HP habilitadas en esa configuración, con un consumo propio máximo cada tres segundos. No reproduce combos, buffs ni todo el motor de Home.

[BoxOfLuck.cs](https://github.com/MUnique/OpenMU/blob/master/src/Persistence/Initialization/VersionSeasonSix/Items/BoxOfLuck.cs) identifica Kundun +1–+5 como grupo 14, número 11, niveles internos 8–12. No se confunde con Box of Luck nivel 0, medallas, Box of Heaven o Symbol of Kundun. El dato viene de `droppedItem.item.lvl`.

Se confirma la recogida con ItemAddedToInventory que contiene Kundun, decodificando número/grupo/nivel según [itemSerializer.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/common/itemSerializer.ts). Perder scope o desaparecer el objeto no incrementa el contador. ItemPickUpRequestFailed pausa G y muestra rechazo; 15 segundos sin confirmación también pausan. La confirmación no devuelve ID del drop: se asocia al único pickup pendiente de la cacería. Intervenciones manuales simultáneas pueden alterar esa asociación.

## Validación local

Las pruebas usan mundo/entidades/paquetes simulados y reloj controlado: cinco destinos de cinco minutos, regiones de igual mapa, avisos repetidos, aprendizaje por clase/servidor, combate, loot confirmado/rechazado, muerte, desconexión, falta de progreso, cancelación, reanudación y módulos sin capacidades nuevas. Una invasión real sigue sin verificarse; no se garantiza cobertura completa del mapa en cinco minutos ni kills si el personaje carece de daño/equipo.

## Corrección verificada de Arena · 2026-10-07

El bundle público https://mu.mormon.garden/assets/layout-DFCVGNpE.js enumera WD_83ARENA2=83, WD_84ARENA3=84 y WD_85ARENA4=85. La capa stadium comparte assets entre esos mundos y WD_6STADIUM; compartir terreno no implica compartir ID. Helper 1.15.4 usa los IDs correctos para llegada y precarga, sustituyendo la suposición anterior. La reproducción con Helper 1.15.3 y snapshot map=85 devolvía Lorencia con X/Y vacíos. Las regresiones usan ahora los tres IDs reales, incluyendo una llegada manual antes de Agregar mapa.
