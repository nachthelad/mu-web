# Zen sin moverse — Implementation Plan

**Goal:** Cambiar la opción de Zen para que recoja al alcance inmediato sin iniciar movimientos.
**Architecture:** Helper conserva el picker y scheduler; el dinero usa la petición nativa directa y el resto conserva pickupTarget. Misma clave loot.zen.
**Tech Stack:** Userscript JavaScript, Node test y Playwright.
**Spec:** ../specs/2026-10-07-zen-stationary-design.md

- [x] Verificar ItemPickupSystem público y su alcance por casillas.
- [x] Añadir zenInReach y request directo en src/helper/level-helper.user.js; impedir escrituras de movimiento y no cancelar un target manual posterior.
- [x] Cambiar etiqueta/ayuda a Zen sin moverse y conservar preferencias.
- [x] Probar límites, Todo/rango, rechazo/timeout y no modificar posición/camino en tests/zen-stationary.test.cjs; actualizar confirmación directa en tests/route-loot.test.cjs y tests/route-loot-ui.cjs.
- [x] Documentar, inspeccionar captura y ejecutar release completo con validaciones completas.

Validación final: 97 pruebas de lógica y nueve suites UI aprobadas. Captura Obtener inspeccionada. Partida real no verificada.
