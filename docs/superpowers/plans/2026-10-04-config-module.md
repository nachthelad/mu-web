# Config module Implementation Plan

**Goal:** Config independiente y registro extensible compatible con v1.
**Architecture:** hosts y acciones aportados por cada módulo; Config coordina transacciones de edición, HUB monta capacidades opcionales. No nuevos motores.
**Tech Stack:** userscripts JavaScript, Shadow DOM, Node test runner y Playwright.
**Spec:** ../specs/2026-10-04-config-module-design.md

## Constraints

Preservar cambios existentes, fuentes canónicas y claves actuales. Release local validado y sin instalación. Ejecución autorizada en este chat; implementación en esta sesión.

## Tasks

- [x] Añadir preferencias y proveedor de ajustes Helper; probar ruta personalizada, búsqueda y party independiente.
- [x] Añadir proveedor Radar y conservar su captura aunque los puntos estén ocultos.
- [x] Crear Config con edición transaccional, cierre, foco, arrastre, registro tardío y rollback.
- [x] Ampliar HUB con hosts opcionales y ventana descubierta; probar módulo ficticio y legacy.
- [x] Incluir Config en demos y release/rollback, conservando conjuntos de tres módulos.
- [x] Actualizar pruebas, documentación, versiones y capturas; ejecutar release conjunto.

## Review focus

Carga en cualquier orden, módulos duplicados/ausentes, valores inválidos, error de almacenamiento sin pérdida y ciclo activo al cambiar spots. Cada escenario se verifica en pruebas de lógica o navegador antes del release.
