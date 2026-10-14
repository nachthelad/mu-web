# Ocultar mi casco

Diseño aprobado en este chat el 2026-10-04. Opción en configuración de Helper, apagada al cargar, sin persistencia. Solo afecta el modelo de la entidad local; inventario, charAppearance, stats y paquetes permanecen intactos. Los efectos generales del equipo se conservan.

Adaptar loadPartAsync en la instancia propia y omitir únicamente HelmMask. Descargarlo invalida cargas pendientes; conservar Helm y recuperar la cabeza por clase si falta. Restaurar el método original y marcar la apariencia para aplicar el equipo actual al desactivar. Reconciliar mundo, entidad y modelo desde el refresh existente de 500 ms. Suspender en transformaciones, Chaos Castle, carga y pantallas fuera del mundo. No modificar prototipos ni HUB. Errores cosméticos no pausan el ciclo.

Referencia upstream: Ignies/OpenMu-Client-Babylon, commit 41147b8171fae04825eb6ad59b0b6a973cf928f3; appearanceSystem.ts:94, playerObject.ts:327 y 442, modelObject.ts:1919, modelLoaderSystem.ts:113. La versión desplegada y el resultado visual real no están confirmados.

Validar cancelación de cargas, cambio de equipo/modelo/personaje, excepciones, reversión y datos intactos con mocks y UI local. Release mediante gestor del proyecto, sin instalar en navegador.
