# Ocultar mi casco Implementation Plan

**Goal:** Omitir localmente el casco propio conservando equipo y stats.
**Architecture:** Adaptador por instancia dentro del userscript Helper; reconciliación con el refresh existente y restauración mediante charAppearance.changed.
**Tech Stack:** JavaScript userscript, node:test, Playwright.
**Spec:** ../specs/2026-10-04-hide-helmet-design.md

## Constraints
Solo fuentes canónicas; contrato v1 y storage existentes intactos; sin cuenta real, publicación web ni instalación. Preferencia apagada en cada recarga.

## Review focus
Cargas pendientes; modelo reemplazado; transformaciones; equipo cambiado mientras está oculto; excepción cosmética aislada del motor.

## Tasks
- [x] Exportar HideHelmet para probar adaptador por instancia, descarte y restauración; cubrir las cinco condiciones anteriores con mocks que simulen loadSeq.
- [x] Añadir checkbox y estado accesible en configuración; llamar sync desde refresh y detach al salir; comprobar funcionamiento con Play pausado y sin comandos nuevos.
- [x] Registrar Helper y documentación; ejecutar sintaxis, lógica e interfaz mediante el gestor de release.

Resultado: la primera release se detuvo por edición concurrente. El chat GOLDEN HUNT conservó esta implementación y publicó Helper 1.10.3 junto con su cambio autorizado de Tarkan, tras 71 pruebas y seis suites UI. Se verificó igualdad de hashes entre fuente, dist y manifiesto; no se instaló en el navegador. Captura: docs/screenshots/helper-hide-helmet.png.
