# Interfaz adaptable: implementación

**Goal:** entregar userscript independiente que retire dragones y adapte la barra clásica conservando orbes y controles.

**Architecture:** CSS acotado y variables por nodo sobre la barra nativa, observación del DOM para React y resize. Sin comandos ni clones de controles.

**Tech Stack:** JavaScript, CSS, MutationObserver, Playwright.

**Spec:** docs/superpowers/specs/2026-10-07-interface-bar-design.md

## Restricciones

Solo proyecto local. Fuentes en src/interface/interface.user.js; dist generado por release. Contrato v1 intacto. Sin instalación en navegador ni cuenta real.

## Verificaciones

- Montaje tardío y reemplazo: readaptar sin duplicación.
- Actualizaciones nativas: conservar números y fill dinámicos.
- Escala y resize: barra a todo el ancho sin deformación.
- Selector skills y tooltips: permitir desbordamiento vertical.
- Desactivar y variante desconocida: preservar estilos originales.

## Tareas

- [x] Crear adaptador nativo y demo en demos/interface con estructura verificada en el bundle público.
- [x] Verificar geometría y handlers con tests/interface-ui.cjs, incluyendo los cinco casos anteriores.
- [x] Integrar módulo opcional interface al gestor de releases y sus fixtures; registrar changelog y documentación.
- [x] Ejecutar release con todas sus validaciones, inspeccionar capturas y entregar dist/interface.user.js.
