# Panel externo de MU

Objetivo aprobado por el usuario: icono de extensión abre/enfoca una pestaña propia, toda la configuración y controles fuera del juego, motores únicos en la pestaña del juego. Ejecutar en este chat hasta release local, sin instalación habitual ni publicación.

Arquitectura: fuentes nuevas en src/extension, worker limitado a apertura y enrutamiento, puente aislado hacia adaptador MAIN. Adaptador de presentación serializa únicamente los hosts registrados de Config/Radar/Analytics. Reutiliza formularios, validación y transacciones originales mediante eventos acotados sobre nodos vigentes; no copia motores ni almacenamiento. Actualizaciones incrementales, vista seleccionada, máximo una lectura por segundo. Radar transmite imagen de su canvas original. Identidad sin tokens: mundo, cuenta, servidor y personaje; generación aleatoria por documento y revisión de identidad. Cambios invalidan borradores/acciones y requieren reconexión explícita.

- [x] Integrar assets canónicos en generador, hashes, race checks y verificación histórica de paquetes anteriores.
- [x] Implementar apertura única, selección de pestaña, puente, validación de mensajes, timeout sin reintentos de acciones.
- [x] Implementar panel adaptable con controles de motor, vistas originales, minimapa opcional y estado de conexión.
- [x] Probar dos pestañas, persistencia, cancelación, identidad, recargas, reapertura, worker, rechazo y ejecución standalone.
- [x] Actualizar documentación/changelog y generar release completo; probar paquete entregado y capturas.

Entrega: extensión 1.0.13, Config 1.3.1 y Analytics 1.1.4; conjunto 2026-10-10T11-36-24-443Z-22a04e. Pasaron 162 pruebas de lógica y todas las suites de UI. Se volvió a cargar dist/chrome-extension directamente: pasaron los 15 grupos del panel. Hashes de los 14 archivos y de las seis fuentes verificados; checksum ZIP comprobado. Logs y resumen en artifacts/extension-panel-release-verified.log, extension-panel-package-verification.log y extension-panel-delivery.json. Sin instalación habitual ni partida real.

Riesgos a comprobar: respuesta tardía de documento anterior; doble click/reconexión; form enfocado durante actualizaciones; cambios externos en cuenta; pérdida de worker. No migrar datos, no ampliar permisos a otros sitios, no prometer ejecución con pestaña suspendida. Apariencia: escritorio oscuro oliva, acentos oro, navegación lateral y formularios legibles con espacio amplio.
