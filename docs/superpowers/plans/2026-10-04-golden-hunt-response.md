# Golden hunt response Implementation Plan

**Goal:** perseguir las detecciones de Radar y cerrar cada mapa tras cinco kills propias con loot confirmado.
**Architecture:** Radar publica snapshots y notificaciones; Helper decide y ejecuta. HUB conserva presentación. Contrato v1 y storage intactos.
**Tech Stack:** userscripts JavaScript, node:test, Playwright.
**Spec:** ../specs/2026-10-04-golden-hunt-response-design.md (aprobado en conversación).

## Tareas

- [x] Verificar muerte atribuida, niveles y servicio de skills upstream.
- [x] Compartir live/recent desde Radar y disparar evaluación inmediata en Helper.
- [x] Corregir filtros, mantener objetivo, detectar progreso y contar kills por mapa.
- [x] Ordenar destinos y resolver quinta kill/drop antes de salir.
- [x] Agregar regresiones de motor y demo con latencia controlada.
- [x] Actualizar documentación, versiones y ejecutar release completo.

## Revisión

No confundir scope con muerte, netId con encuentro, mapa con destino ni requisito de entrada con nivel de enemigo. Preservar timers nativos 16px de Helper 1.9.2 y cambios ajenos. Sin cuenta real, instalación ni publicación web.

Se ejecuta en este chat; no se crean commits porque .git tiene permisos de lectura y no hay autorización de publicación.

Validación final: 66 pruebas de lógica y seis suites UI; release 2026-10-04T15-40-16-230Z-671d64. Radar 1.4.1, Helper 1.10.1, HUB 1.2.1. Demo: 190 ms desde aparición hasta objetivo y 0 ms adicionales desde notificación de Radar.
