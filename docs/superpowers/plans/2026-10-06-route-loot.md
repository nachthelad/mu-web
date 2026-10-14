# Ruta editable y loot compacto — Implementation Plan

**Goal:** Implementar la ruta y configuración de loot aprobadas, con Config minimizable.
**Architecture:** Helper conserva motor/scheduler/almacenamiento. Config conserva transacciones y añade un estado visual minimizado. Ruta y política de loot son campos opcionales de preferencias v1.
**Tech Stack:** Userscripts JavaScript, Shadow DOM, Node test y Playwright.
**Spec:** ../specs/2026-10-06-route-loot-design.md

## Restricciones y revisión

Fuentes únicamente en src; contrato v1; no tocar datos ni instalación real. Revisar datos legacy, ruta vacía/umbrales inválidos, mismo mapa distinto destino, reset debajo del mínimo, filtros nativos simultáneos y borradores minimizados.

- [x] Añadir catálogo, migración aditiva y selección por nivel en src/helper/level-helper.user.js; probar límites, configuración antigua, variantes y reset en tests/route-loot.test.cjs.
- [x] Añadir política de categorías y nombres al picker existente; probar AND/OR, jewels por ID, Zen, confirmaciones y cancelaciones en la misma suite y conservar la suite de Excellent.
- [x] Reemplazar spots fijos por filas editables y pestañas Leveleo/Obtener; conservar Save/Cancel/rollback y actualizar tests/config-ui.cjs y tests/excellent-loot-ui.cjs. Verificar agregar/quitar/reordenar, mínimos, persistencia y retorno de cacería.
- [x] Añadir minimización/restauración a src/config/config.user.js sin begin/discard; verificar borrador, foco, Escape, HUB y viewport con tests/config-ui.cjs.
- [x] Actualizar versiones/changelog/README, generar capturas y ejecutar npm run release para validación completa e instalables. Inspeccionar las capturas finales.

Validación final: 93 pruebas de lógica y nueve suites de interfaz aprobadas mediante release. Capturas inspeccionadas; partida real no verificada.
