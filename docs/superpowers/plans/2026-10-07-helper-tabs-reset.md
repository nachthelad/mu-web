# Reset opcional y pestañas — Implementation Plan

**Goal:** Añadir reset opcional, pestañas Party/Visualización y checkbox Ocultar casco.
**Architecture:** Helper conserva motores y contrato v1. autoReset es una preferencia aditiva; las cuatro pestañas conservan el formulario transaccional y el casco sigue siendo por sesión.
**Tech Stack:** JavaScript, Shadow DOM, Node test, Playwright.
**Spec:** ../specs/2026-10-07-helper-tabs-reset-design.md

- [x] Añadir autoReset en DEFAULTS, validación, lectura/aplicación y condición de Cycle. Cancelar únicamente el reset en cola aún no enviado al desactivarlo.
- [x] Convertir Party y Visualización en paneles de pestaña; ampliar teclado y cambiar a checkbox positivo Ocultar casco.
- [x] Añadir tests/optional-reset.test.cjs para defecto legacy, persistencia válida, 400+ sin reset, activación tardía y petición enviada.
- [x] Adaptar y completar tests/config-ui.cjs, tests/helper-ui.cjs y tests/route-loot-ui.cjs: borradores/persistencia, cuatro pestañas, cancelación de cola, casco y capturas.
- [x] Actualizar documentación y generar release completo, inspeccionando capturas e instalable.

Validación final: 100 pruebas de lógica y nueve suites UI aprobadas mediante release. Capturas de Leveleo, Party y Visualización inspeccionadas.
