# Caza del Balrog Colosal · Helper 1.27.0

## Uso

Config → Caza: habilitá el Balrog. El switch se guarda automáticamente por mundo/cuenta y no inicia acciones. Con ubicación válida aparece su Play/Pausa debajo del Play de leveleo; comparten el asa para moverlos. Config standalone y panel externo usan los mismos controles.

Play pausa leveleo, detiene Home antes de moverse, viaja al mapa anunciado y camina hasta la casilla. Confirma llegada por mapa/posición y enciende Home con sus skills, pociones y filtros configurados. No agrega persecución ni comandos propios de ataque/loot; Home puede combatir/moverse/recoger según su configuración nativa.

Pausa detiene Home, espera confirmación y libera el control. Después podés activarlo manualmente desde el teclado sin que el addon vuelva a apagarlo. Caza no se rearma al próximo evento. Leveleo queda pausado; su Play lo reanuda y cancela Caza. Fin/vencimiento, cambio de destino, muerte o pérdida de sesión cancelan nuevas acciones; un warp enviado puede completar aunque se pause.

Reset, viaje y Home pendientes bloquean el inicio. Un solo warp, hasta 30 s para confirmarlo, pausa tras 20 s sin progreso y máximo de viaje 120 s. Home conserva timeout de 10 s. Se validan mínimos de nivel conocidos; equipo, Zen y restricciones adicionales quedan sujetos al servidor. No hay reintentos ilimitados.

## Evidencia pública del 2026-10-13

Consulta sin cuenta: raíz https://mu.mormon.garden/, entry index-Drn8eqTh.js, boot-ggOjq5Um.js y layout-DJi2NQ83.js. Copias en artifacts/balrog-research. Catálogo: Balrog Colosal tipo 694; el Balrog normal tipo 38 no es señal.

ServerMessage decodifica texto inglés original antes de CO/nk y elimina nueve ceros iniciales. Tipo 0 pasa por Vvt: bigBossAppeared, bigBossStillOut, bigBossLeft y muerte invasionMonsterDefeated que termina con Balrog Colosal. Tipo 1 reconoce el formato específico The Big Boss is already out, con mapa, X/Y y salud. El addon reutiliza serverMessage y valida cabecera/longitud, tipo y formatos específicos.

Chat, otros monstruos, nombres de mapa desconocidos, coordenadas no enteras o fuera de 0..255 no habilitan el viaje. Los destinos se resuelven al catálogo M existente, con variantes explícitas y alias Davias/Devias. Tras warp se exige MapChanged y world.mapIndex antes de caminar.

Para recuperar una aparición anterior a la carga del addon, solo el entry auditado habilita el import del módulo ya cargado por el juego. Export ee/Uxt devuelve running, seconds, map, spot. Horario sin ubicación nunca habilita viaje. El snapshot vence según seconds y no renueva su timestamp al renderizar. Tras identidad/fin/dato inválido, bloquea recuperación vieja hasta un anuncio nuevo. Builds desconocidos conservan recepción de paquetes compatibles, sin importar módulos supuestos.

Máximo nativo: 30 minutos desde el primer aviso; StillOut conserva inicio. Horas UTC en el código: 1,4,7,10,13,16,19,22; minuto 0. Describe código público, no reemplaza los horarios entregados por el usuario ni confirma configuración real del servidor. Caza nunca se activa por horario.

## Arquitectura y validación

BalrogEvent/BalrogTrip viven en Helper, dentro de su refresh de 500 ms y cola/NativeHelper existentes. Sin intervalos nuevos. Durante Caza se suspenden Cycle, Soul Shield y Obtener del addon. HUB y extensión presentan estado y controles originales. balrogEnabled es opcional en preferencias v1 por cuenta, false por ausencia; autosave mantiene semántica Guardar/Cancelar/rollback. actions.balrog y getState().balrog son capacidades opcionales v1. actions.gold sigue inerte; contador, mapas, minimapa e historial de Radar se conservan.

tests/balrog.test.cjs: parser, variantes, vigencia, recuperación vieja, viaje confirmado y errores acotados. tests/balrog-ui.cjs: scheduler real con Home previo, warp, llegada, Pausa/Home desde teclado, apagado, fin/cambio, reset pendiente, personaje, obstáculos, fin durante warp y Home demorado. tests/extension-panel-ui.cjs: switch y Play/Pausa proyectados, overlay independiente y Home manual. Capturas caza-config-preview.png, caza-balrog-preview.png y caza-panel-external-preview.png en docs/screenshots.

Pruebas con demos y Chromium aislado sin cuenta real. No confirman navegación, anuncios ni combate en partida real.

Release local verificado: Helper 1.27.0, extensión 1.0.30; conjunto 2026-10-13T12-25-58-416Z-188c89. Sintaxis, 194 pruebas de lógica y todas las suites de interfaz/paquete aprobadas. Hashes de fuente/instalable, paquete MV3 y ZIP comprobados.
