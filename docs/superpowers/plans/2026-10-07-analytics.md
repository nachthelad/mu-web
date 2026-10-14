# Analytics Implementation Plan

**Goal:** entregar un instalable Analytics con mediciones manuales de 5 minutos y ranking persistente.
**Architecture:** motor y ventana independientes en src/analytics/analytics.user.js; HUB monta el botón existente por capacidades v1. Ganancia confirmada desde experienceGained, sin comandos del juego.
**Tech Stack:** JavaScript userscript, Shadow DOM, localStorage, node:test, Playwright.
**Spec:** ../specs/2026-10-07-analytics-design.md

## Constraints and review focus

Conservar fuentes y claves actuales. No tocar instalaciones ni cuenta real. Contar cambios de nivel con eventos de ganancia; interrumpir reset/party/mapa/muerte. No sobrescribir historial inválido. No incluir muestras parciales en ranking ni mezclar personajes/party/bandas. Conservar compatibilidad de rollback de cuatro y tres módulos.

## Tasks

- [x] Crear Measurement.start(snapshot, now), gain(added, snapshot, now), tick(snapshot, now) y finish(status, reason, now), con pruebas de límite 300000 ms, cambio de nivel, reset, muerte, radio, party y ganancias inválidas. Crear ranking(records) solo para completas; probar promedios y separación por contexto.
- [x] Crear ventana y acceso con capabilities.actions, exportación y borrado explícito, posición persistente, historial validado y rebind del bus. Crear demos/analytics/preview.html y demo.js; probar con reloj simulado, recarga, HUB temprano/tardío, ventana cerrada y viewport compacto. Capturar PNG.
- [x] Extender scripts/release-manager.cjs y fixture tests/releases.test.cjs con analytics opcional en conjuntos antiguos; agregar test de rollback sin analytics. Incorporar analytics-ui.cjs a scripts/test-ui.cjs.
- [x] Documentar instalable, fuente EXP y límites en README, addon-design, organization-and-updates y changelog. Ejecutar npm run release sin omitir validaciones; verificar hashes/versiones.

Ejecución directa en este chat conforme a la aprobación del usuario; no requiere nuevos agentes ni cambios en otros proyectos.
