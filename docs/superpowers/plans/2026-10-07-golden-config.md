# Golden configuration implementation plan

Goal: implementar el plan aprobado de Goldens, Play como control común y Soul Shield en Leveleo.

Architecture: Helper conserva su scheduler y motores; Radar expone contador y mapas restantes y controla la captura de spots. Config monta el proveedor existente, HUB conserva sus acciones.

- [x] Radar: validar InvasionMonsters, leer countdown del HUD, conservar identidad entre aviso y comienzo, ofrecer control de captura sin borrar historial.
- [x] Helper: preferencias v1 opcionales, ruta editable con mínimos y toggles, snapshot por evento, Play obligatorio y Soul Shield coordinado con Home.
- [x] Pruebas: countdown, paquetes truncados y vencidos, configuración transaccional, cancelación, recorrido, buff confirmado/ausente y vistas compactas.
- [x] Entrega: documentación, versiones, capturas y release conjunto con todas las suites. Preservar modificaciones preexistentes; no instalar ni publicar online.
