# Invasion Tracking Implementation Plan

**Goal:** mostrar White Wizard Corps y Red Dragon con controles independientes.

**Architecture:** Tracker parametrizado con catálogo adicional; mismo scheduler, separación del contrato Golden hunt.

**Tech Stack:** userscript JavaScript, Node test, Playwright.

**Spec:** ../specs/2026-10-07-invasion-tracking-design.md

## Constraints and review

Conservar contrato v1, claves y motores. Preferencias por sesión, apagadas por defecto. Guardar aplica; Cancelar descarta. Validar independencia de dorados, muerte, caducidad y cambio de mapa. Release local únicamente.

## Tasks

- [x] Verificar catálogo upstream: 42 y 135–137.
- [x] Añadir Tracker separado, filtros, checkboxes transaccionales, leyenda y colores.
- [x] Probar lógica e interfaz con configuración y snapshot de cacería.
- [x] Actualizar documentación y publicar Radar 1.8.0 mediante release completo de validaciones.
