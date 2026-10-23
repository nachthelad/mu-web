# Client compatibility implementation plan

**Goal:** restaurar la conexión de la extensión con el cliente del 21/10 sin globals.
**Architecture:** inicializador acotado al build auditado en page-bridge.js; getters sobre los mismos singletons exportados por el cliente. El panel presenta fallos de compatibilidad.
**Tech stack:** Chrome MV3, JavaScript, Playwright y release manager existente.
**Spec:** ../specs/2026-10-21-client-compatibility-design.md

## Restricciones

- Preservar motores, contrato v1, identidad, leases y almacenamiento.
- No importar boot, iniciar Play ni usar cuenta real para pruebas.
- No editar dist/releases: generarlos exclusivamente con npm.cmd run release.
- Conservar todos los cambios preexistentes del checkout.

## Tareas

- [x] Agregar inicializador de compatibilidad y diagnóstico en src/extension/page-bridge.js y panel.js. Reconocer solamente /assets/index-URnTVW_1.js y cargar /assets/layout-DQbdTT-G.js, exports n/V/aw. Validar antes de publicar getters; __world lee store.world.
- [x] Probar en tests/extension-client-ui.cjs: legacy sin importaciones, build conocido sin globals, módulo evaluado una vez, cambio del mundo, carga tardía, exports inválidos y build desconocido. Agregarlo al runner obligatorio. Ejecutar node tests/extension-client-ui.cjs.
- [x] Ejecutar también el flujo completo del panel con fixture del cliente nuevo, conservando un segundo destino legacy.
- [x] Registrar alcance y límites en README.md, docs/extension-architecture.md y docs/changelog.md.
- [x] Ejecutar npm.cmd run release; esperar todas las validaciones y comprobar manifest, ZIP y checksum. Entregar instalable local con instrucciones de actualización.

## Revisión

Revisar explícitamente: importación fallida, identidad no autenticada, reemplazo de world, doble inicialización y respuesta de una lease vencida. No inferir compatibilidad de estadísticas/alas con exports de otro build.

## Resultado

Release local 2026-10-21T21-45-32-356Z-0d0d17, extensión 1.0.42. Pasaron sintaxis, 225 pruebas de lógica y todas las suites obligatorias de interfaz. Verificación final en artifacts/client-fix-release-verification.json. El primer intento fue bloqueado por EACCES del sandbox al conectar con el servidor local; el release completo terminó correctamente fuera de esa restricción. Sin instalación en navegador habitual ni prueba con cuenta real.
