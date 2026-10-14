# Golden hunt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Cazar dorados durante la invasión, recoger Kundun y devolver el control al leveleo según su botón.

**Architecture:** GoldenHunt y MoveLevels viven en Helper y usan su refresh de 500 ms. Radar expone avistamientos y señales del evento mediante capacidades aditivas de contrato v1. HUB muestra G sin scheduler ni comandos.

**Tech Stack:** Userscripts JavaScript, EventBus del cliente, localStorage, node:test y Playwright.

**Spec:** docs/superpowers/specs/2026-10-04-golden-hunt-design.md

## Global Constraints

- Ruta: Tarkan2 → Atlans2 → Atlans3 → Lorencia → Davias.
- Cinco minutos de búsqueda en cada destino, contados desde la llegada confirmada.
- Se conserva contrato v1, las acciones existentes y todas las claves de almacenamiento.
- No se usa cuenta real.
- Los instalables se entregan desde dist; no se instala Tampermonkey ni se publica en Internet.

## Review Focus

- Atlans2/3 comparten ID: exigir confirmación de warp posterior al comando.
- Nivel desconocido: aprender solo respuestas de servidor correlacionadas al traslado pendiente.
- Loot: desaparición por scope no prueba recogida; exigir respuesta de inventario y comprobar Kundun.
- Cancelación: retirar solo movimientos y objetivos propios, sin dejar comandos pendientes.
- Evento por mapa: un warp no implica fin global; no reiniciar la ruta con cada anuncio local.

## Task 1: Fuentes verificadas y motor

Files: src/helper/level-helper.user.js, tests/golden-hunt.test.cjs, docs/golden-hunt-client.md.
Interfaces: GoldenHunt.step(snapshot, context, now) devuelve una acción o null; MoveLevels.required(snapshot, destination) devuelve número o null; MoveLevels.learn(snapshot, destination, text) devuelve boolean.

- [x] Corroborar ServerMessage (C1 0D, type en 3, texto desde 4), MapEventState (evento 3), MapChanged, ItemAddedToInventory e ItemPickUpRequestFailed contra upstream.
- [x] Añadir pruebas de requisitos por personaje/clase, rechazo por dinero, recorrido cronometrado, warp mismo mapa, prioridad histórica, cancelación, errores y loot confirmado. Ejecutar `node --test tests/golden-hunt.test.cjs` antes y después del motor.
- [x] Implementar máquina de estados y recorridos desde spots históricos y grilla transitable. Reutilizar `world.attackTarget`, `world.castRequest`, `world.pickupTarget` y Home apagado durante cacería.
- [x] Separar intención `cycle.running` de suspensión por cacería; reiniciar stage/progreso al devolver control. Prueba: apagar Helper durante cacería no lo reinicia.

## Task 2: Radar y HUB

Files: src/radar/golden-radar.user.js, src/hub/hub.user.js, docs/addon-design.md.
Interfaces: radar.actions.huntingData() devuelve records, tipos y evento; helper.actions.gold() alterna G; helper.getState().gold devuelve enabled, active, message y ready.

- [x] Exponer copias de records y señales de servidor desde Radar; conservar listeners/scheduler y claves actuales.
- [x] Agregar G accesible en HUB y estado de cacería; comprobar capabilities antes de habilitarla. Reutilizar acción del botón standalone de Helper.
- [x] Registrar módulos en cualquier orden; Helper descubre Radar aunque HUB no esté presente.

## Task 3: Demo, validación y release

Files: demos/hub/preview.html, demos/hub/golden-hunt-demo.js, tests/golden-hunt-ui.cjs, scripts/test-ui.cjs, docs/changelog.md, README.md.

- [x] Simular invasión, cinco destinos, rechazos de nivel, muerte, dorado y Kundun sin cuenta; probar el flujo mediante reloj controlado y eventos reales del adaptador.
- [x] Ejecutar `npm run check`, `npm test` y `npm run release`; release ejecuta toda la UI. Capturar G/configuración abiertas.
- [x] Revisar diff, documentar límites de validación real y entregar los tres instalables de dist.

Ejecución nativa en este chat autorizada por «ok arrancá». Se preservan cambios preexistentes y no se pide otra aprobación de este plan.

## Resultado

Implementado y publicado localmente en el conjunto `2026-10-04T06-48-43-797Z-18eb0a`: Radar 1.4.0, Helper 1.9.0 y HUB 1.2.0. Release pasó sintaxis, 62 pruebas de lógica y seis pruebas de interfaz. Se verificaron hashes y coincidencia exacta entre fuentes e instalables; se retiraron únicamente los temporales de investigación dentro del proyecto. Captura revisada: `docs/screenshots/golden-hunt-preview.png`. Partida real no verificada.
