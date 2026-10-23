# Transporte al iniciar en variantes compartidas

Alcance autorizado: corregir Cycle sin cambiar preferencias ni contrato v1.

La causa es el warp inicial obligatorio para mundos con varios destinos. La
posición en el mundo y la distancia al spot seleccionado permiten evitarlo
cuando ya está dentro de la tolerancia de llegada existente (2 casillas).
Lejos del spot se conserva el warp explícito y su confirmación; un cambio real
de etapa a otra variante conserva el warp incluso cerca del nuevo spot.
MapVisit sigue conservando el spot entre pausas. No se deducen regiones.

- [x] Agregar regresiones de inicio/reanudación cerca, selección estable,
  mundo distinto, etapas del mismo mundo, viajes pendientes y reset/mínimos.
  Ejecutar `node --test tests/map-leveling.test.cjs` y comprobar el fallo nuevo.
- [x] Acotar la condición inicial de needsWarp en
  `src/helper/level-helper.user.js` a distancia mayor que 2. Conservar la
  condición independiente de cambio de variante y toda confirmación pendiente.
  Volver a ejecutar la suite focalizada.
- [x] Documentar política en `docs/level-routes.md`, incrementar Helper a
  1.29.4 y registrar changelog/README. Revisar diff y actividad concurrente.
- [x] Ejecutar `npm run release -- --module helper` con todas sus validaciones;
  verificar versiones/hashes y entregar userscript y ZIP de `dist`.

Revisión: cubrir el límite de 2 casillas, zona segura, confirmación tardía,
rechazo y cambio de nivel mientras se espera un warp. Validación solo local.

Resultado: 25 pruebas focalizadas y regresión browser con F10 aprobadas.
Release completo: 214 pruebas de lógica y todas las suites de interfaz,
incluido paquete MV3 en Chromium aislado. La primera ejecución restringida
falló en fetch a localhost; repetir con acceso local completó las validaciones.
