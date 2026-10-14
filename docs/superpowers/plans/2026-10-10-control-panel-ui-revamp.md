# Control panel UI revamp Implementation Plan

**Goal:** Implementar opción A aprobada para las seis secciones, con mayor ancho y menos scroll.
**Architecture:** CSS de la página exterior y CSS de proyección en Shadow DOM; ningún control se duplica ni se mueve fuera de su padre canónico. Grid coloca el editor y el resumen sin alterar reconciliación, eventos o motores.
**Tech Stack:** HTML/CSS, JavaScript nativo, Chromium aislado y suites existentes.
**Spec:** docs/superpowers/specs/2026-10-10-control-panel-ui-revamp-design.md
**Execution:** En este chat, según autorización explícita del usuario. No delegar.

## Restricciones y foco de revisión
- Conservar barra superior, protocolo, permisos, almacenamiento y standalone.
- No confundir persistencia inmediata con Guardar/Cancelar; mantener estados y errores.
- Listas largas, ventana angosta y textos extensos no deben generar overflow de página.
- Foco y selección deben sobrevivir actualizaciones incrementales.
- Recuperación legacy y opciones desplegables deben seguir siendo operables.
- Preservar cambios previos; release oficial completo, sin editar generados.

## Tareas
- [x] Crear tests/extension-layout-ui.cjs: montar módulos actuales en extensión real con fixture aislada, capturar las seis secciones a 1920x1080, 1360x1000 y 390x844, y registrar altura/overflow con datos idénticos. Ejecutar primero con --baseline.
- [x] Ajustar src/extension/panel.css y panel.html: ampliar main/mirror, aplanar workspace, compactar encabezado, corregir texto de persistencia. No editar topbar ni sus reglas responsive.
- [x] Ajustar CSS de src/extension/renderer.js: grid de Leveleo con map-leveling display:contents, filas de spots, progreso y opciones al costado; filas Goldens, columnas Obtener y Visualización, filas simples Party/Estadísticas. Media queries apilan. No cambiar apply/bind ni agregar listeners, controles o wrappers.
- [x] Ejecutar la prueba layout final. Comprobar no overflow, etiquetas, foco y teclado, controles originales y alturas comparables. Revisar capturas y corregir defectos observados. Ejecutar suite funcional extension-panel-ui.cjs con guardados/cancelación/cuenta/puente.
- [x] Agregar regresión de layout a scripts/test-ui.cjs, actualizar docs/extension-panel.md, docs/changelog.md y especificación aprobada. Verificar fuentes estables con git diff/hash; usar npm run release (incrementa versión de extensión automáticamente por cambio de assets).
- [x] Verificar paquete generado con tests/extension-panel-ui.cjs --package dist/chrome-extension y entregar ZIP, capturas y resultados; no instalar ni publicar.

## Comandos de validación
```text
node tests/extension-layout-ui.cjs --baseline
node tests/extension-layout-ui.cjs
node tests/extension-panel-ui.cjs
npm run release
node tests/extension-panel-ui.cjs --package dist/chrome-extension
```

La prueba de layout comprueba geometría y navegación; la suite funcional existente comprueba transacciones y sesiones; release ejecuta además regresiones standalone y motores. No duplicar lógica de implementación con tests unitarios de CSS.

## Resultado (2026-10-10)

Tareas completadas. Extensión 1.0.22, conjunto 2026-10-10T23-39-29-623Z-74dfbd. Release oficial aprobado: 178 pruebas de lógica y todas las suites UI. Paquete final dist/chrome-extension verificado con 19 grupos funcionales. Hash del ZIP comprobado; hashes de los seis módulos idénticos a extensión 1.0.21. Capturas, métricas, comparación interactiva y logs en artifacts/ui-revamp. No instalado ni publicado; partida real pendiente.
