# Alas y Visualización Implementation Plan

**Goal:** Agregar alas cosméticas de Blade Knight y reunir Trackeo/Estilos en Visualización.

**Architecture:** Helper adapta el modelo local en su refresh existente. Radar conserva ajustes; Config monta hosts originales en slots opcionales sin cambiar la transacción.

**Tech Stack:** Userscripts JS, Shadow DOM, node:test y Playwright.

**Spec:** ../specs/2026-10-07-wings-visualization-design.md

## Global Constraints

- Fuentes en src; contrato y almacenamiento v1 compatibles.
- Sin comandos nuevos ni modificaciones de equipo; cosméticos por sesión.
- Release conjunta con todas las validaciones; no instalar en navegador.

## Review Focus

- Cambios de equipo: reconstruir usando el equipo actual al restaurar.
- Cargas pendientes: invalidar el loadSeq anterior al desactivar.
- Fallas asíncronas: restaurar y no filtrar promesas rechazadas.
- Orden de módulos: montar el host una sola vez y conservar borradores.
- Viewport compacto: controles accesibles con scroll interno.

### Task 1: Adaptador cosmético

- [x] Agregar WingStyle en src/helper/level-helper.user.js, con original/own/wrapper por instancia y estilo original/blade-knight.
- [x] Probar en tests/wing-style.test.cjs que las copias renderizadas usan 12/5 y el inventario permanece intacto, incluyendo restauración, fallas, cargas y ausencia de alas.
- [x] Integrar selector y transacción de sesión en Helper; sync en refresh y detach en pagehide.

### Task 2: Presentación de ajustes

- [x] Config resuelve provider.slot contra provider.slots y mueve el host original; Radar declara slot visualization-tracking, Helper ofrece su contenedor Trackeo.
- [x] Actualizar UI existente para abrir Visualización antes de interactuar con tracking.
- [x] Verificar Guardar/Cancelar/rollback, carga temprana/tardía y módulos independientes con pruebas UI.

### Task 3: Entrega

- [x] Incrementar versiones Helper/Radar/Config, documentar contrato y evidencia, registrar changelog.
- [x] Ejecutar npm run release, verificar manifiesto y SHA-256, entregar los tres instalables y captura.

Validación final: release 2026-10-07T19-45-16-077Z-5b3bc0; 127 pruebas lógicas y 15 suites UI aprobadas; SHA-256 fuente/dist/manifiesto coinciden. Incluye la corrección coordinada de Home continuo. Sin instalación ni validación en partida real.
