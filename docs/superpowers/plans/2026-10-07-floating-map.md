# Mapa flotante Implementation Plan

**Goal:** Separar mapa de barra conservando Play de Helper 1.14.1.
**Architecture:** Radar ofrece capacidad opcional floatingMap y actions.map; HUB muestra su control sin duplicar host ni motor.
**Spec:** ../specs/2026-10-07-floating-map-design.md

- [x] Modificar Radar: persistir bloqueo junto a posición existente; attach mantiene posición fija, oculta controles redundantes y conserva bloqueo.
- [x] Modificar HUB: botón Mapa con estado accesible, montar radar flotante en body; mantener fallback legacy.
- [x] Adaptar pruebas de ubicación y agregar arrastre/bloqueo/recarga/minimización independiente; comprobar Play y Config.
- [x] Incrementar versiones, actualizar documentación y ejecutar release completo; inspeccionar captura.

Validación: 100 pruebas de lógica y nueve suites UI aprobadas; captura floating-map-preview.png inspeccionada. Fuente, instalable y hash coinciden para los cuatro módulos.
