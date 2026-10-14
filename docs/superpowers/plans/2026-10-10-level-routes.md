# Rutas de leveleo

Objetivo: conservar la ruta actual y permitir guardar varias rutas, alternar spots válidos y generar borradores desde observaciones locales.

Diseño: ampliación opcional de preferencias v1 (`routes`, `selectedRoute`, `varySpots`). `path` conserva la ruta seleccionada para compatibilidad. Cada ruta conserva pasos estrictamente crecientes y alternativas asociadas al nivel de una etapa. Sin campos nuevos se usa la ruta anterior. Guardar/Cancelar conserva la transacción existente; seleccionar no inicia Play.

Observaciones: mínimo cuatro monstruos únicos dentro de seis casillas, tres muestras separadas por cinco segundos; puntos transitables realmente ocupados, nunca centroides inventados. Persistencia separada por cuenta/mundo y servidor, máximo 120 registros, vencimiento 14 días. Captura pasiva durante Play y fuera de Golden hunt, muerte y carga. Registro es evidencia local, no spawn permanente. NPC/trampas y muerte se filtran como en attackSystem público; eventos especiales excluidos.

Variación: orden circular determinista, permanencia mínima de tres minutos después de llegar, cambio solo sin monstruos vivos a ocho casillas. Mantener objetivo durante tránsito/combate. Mínimos reales por clase; progresión de borrador Lorencia/Noria hasta 49 y Arena desde 50, con Arena 2/3/4 en sus mínimos. Sin observaciones no se inventa ruta. Fallos de navegación omiten candidato por sesión; sin alternativas pausa. Golden hunt, reset y Play conservan prioridad.

- [x] Implementar y probar modelo de rutas, detección y alternancia en Helper canónico.
- [x] Integrar selector, editor de alternativas y revisión/generación de borradores en Config; mantener ruta heredada.
- [x] Validar lógica y demo de persistencia, cancelar, captura y progresión; documentar límites.
- [x] Incrementar Helper, actualizar changelog y generar release local con todas las validaciones y ZIP.
