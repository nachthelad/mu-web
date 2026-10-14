# Estadísticas Implementation Plan

**Goal:** Aplicar el rework autorizado y corregir compatibilidad auditada.
**Architecture:** Hosts y motor actuales; ampliar adaptadores auditados y autoguardado existente.
**Tech Stack:** JavaScript, userscripts, MV3, Node y Playwright.
**Spec:** docs/superpowers/specs/2026-10-14-stats-rework-design.md

- [x] Auditar build público y generar fixture de cálculo sin iniciar juego.
- [x] Simplificar stats y controles; reutilizar autoguardado con base de transacción actualizada.
- [x] Verificar independientes ON/OFF, C/V, desconocidos, A/B, teclado/tooltips y panel externo.
- [x] Versionar, actualizar docs y ejecutar release con todas sus validaciones.

Release local: Helper 1.29.0, extensión 1.0.33, conjunto 2026-10-14T19-31-04-439Z-757ae6. Pasaron 203 pruebas de lógica y todas las suites UI, incluida extensión aislada. Fuente/dist coinciden; checksum ZIP verificado. Log: artifacts/stats-research/rework-release.log. Sin cuenta real ni instalación.
