# Caza Balrog Implementation Plan

**Goal:** Viajar al destino anunciado del Balrog y activar Home al llegar; Pausa detiene Home una vez y lo libera para uso manual.

**Architecture:** Helper recibe ServerMessage y opcionalmente recupera el estado del lector auditado del cliente. Un viaje dentro de su refresh comparte NativeHelper y propiedad de movimiento. Config y overlay proyectan los mismos controles; el panel externo serializa la sección Caza original.

**Tech Stack:** JavaScript userscript, Shadow DOM, Node test, Playwright demos, extensión MV3 existente.

**Spec:** docs/superpowers/specs/2026-10-13-balrog-design.md

## Constraints

Sin cuenta real, instalación ni publicación web. Golden hunt sigue inerte. Preferencia opcional balrogEnabled en v1 por cuenta. Sin nuevos intervalos. Preservar cambios previos.

## Review focus

Mensajes incompletos y anuncios de otros monstruos; estado nativo viejo al cambiar identidad; reset/warp ya enviado; confirmación Home demorada al pausar; mapa compartido sin confirmación de warp.

## Tasks

- [x] Crear BalrogEvent y BalrogTrip en src/helper/level-helper.user.js con tests/balrog.test.cjs. Parser restringido a ServerMessage tipo 0 y al estado específico tipo 1 auditado; destino entero 0..255 y nombre del catálogo. Inicio/fin/StillOut con límite 30 minutos. Viaje con fases Home off, warp confirmado, caminar con progreso y Home on. Una orden de warp; timeout 30 s, caminar con progreso 20 s y límite total 120 s. Fallos cancelan sin rearmar.
- [x] Integrar en refresh existente, cancelación de identidad, Home y arbitraje con Cycle. Play explícito bloquea reset/warp pendientes; iniciar leveleo cancela Caza. Pausa y fin limpian acciones propias y detienen Home hasta confirmación, luego desiredHelper=null.
- [x] Agregar Caza, switch autosave y controles originales proyectables; overlay condicional independiente. Preservar gold retirado y transacciones. Adaptar descripción del panel externo.
- [x] Agregar tests/balrog-ui.cjs a scripts/test-ui.cjs con anuncios, llegada/Home, pausa/Home manual, fin, muerte, cambio de identidad, reset, navegación fallida, autosave y proyección del panel. Revisar cambio de orden de tabs en tests/golden-retired-ui.cjs.
- [x] Documentar evidencia en docs/balrog-client.md; incrementar Helper y changelog; ejecutar npm run check, npm test y npm run release -- --module helper. Inspeccionar manifiesto/ZIP/capturas. Reportar pruebas locales y partida real pendiente.

## Resultado

Release local 2026-10-13T12-25-58-416Z-188c89: Helper 1.27.0, extensión 1.0.30. Sintaxis, 194 pruebas de lógica y todas las suites UI/paquete/Chromium aprobadas. Se actualizó la expectativa de pestañas de cinco a seis por Caza; distribución anterior preservada durante el intento fallido. Sin cuenta real, instalación ni publicación web.
