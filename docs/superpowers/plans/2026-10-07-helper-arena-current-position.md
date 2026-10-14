# Helper: Arena y precarga

Spec: ../specs/2026-10-07-helper-arena-current-position-design.md, aprobada por el usuario.

Implementación secuencial en las fuentes canónicas; no delegación ni cambios de otros motores.

- [x] Reproducir la espera de Arena con confirmación de servidor cuyo destino difiere del ID fijo. Decodificar MapChanged/075, asociar confirmación posterior al traslado pendiente y esperar el mapa informado, sin inferir llegada por movimiento o tiempo. Mantener rechazos y timeout.
- [x] Precargar mapa, nivel y casilla actuales al agregar un paso; preservar borrador, fallback manual y validación.
- [x] Verificar lógica y UI, actualizar versión/changelog/README y generar release del Helper con las validaciones existentes.

No instalar en navegador ni afirmar funcionamiento real a partir de demos.
