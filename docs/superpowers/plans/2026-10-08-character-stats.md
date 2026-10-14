# Character stats implementation plan

Goal: Implementar el diseño aprobado de estadísticas y comparación A/B.
Architecture: Adaptador puro y comparación en el userscript canónico; panel Shadow DOM del Helper y proveedor Config existente. Cálculo del cliente reutilizado desde el módulo ya cargado del build auditado.
Tech Stack: JavaScript, Node test runner y Playwright local.
Spec: ../specs/2026-10-08-character-stats-design.md

- [x] Verificar bundle público y exports del cálculo nativo; documentar origen y límites.
- [x] Implementar adaptador, capturas y diferencias; probar ausencia de datos, base cero, copia independiente y cambio de identidad.
- [x] Integrar switch transaccional, pestaña y panel con refresh existente; probar Guardar/Cancelar, Play pausado, integración y viewport compacto.
- [x] Actualizar versión y documentación; ejecutar release validado y comprobar hashes fuente/dist.

Restricciones: preservar cambios previos; no tocar dist/release manualmente ni cuenta real. Datos de equipo desconocidos bloquean cálculo; no inferir buffs ni daño efectivo. Capturas no persistidas. Revisión: cambio de cuenta durante edición, rollback, datos incompletos, identidad reemplazada entre ticks y función desactivada.
