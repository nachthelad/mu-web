# Barra superior del Centro de control

Diseño solicitado por el usuario: todos los selectores y Play/Pausa arriba y visibles al scrollear, con actualización de extensión. El panel actual es chrome-extension, sin dependencia de localhost.

Arquitectura: header sticky único con navegación global, pestaña/conexión, selector de secciones originales de Helper y controles existentes. Renderer proyecta selección por sus botones canónicos, sin nuevos motores, temporizadores de juego ni almacenamiento. El selector se sincroniza desde aria-selected de los controles originales. CSS adapta filas en pantallas angostas y evita desbordamiento horizontal.

Actualización local: botón abre diálogo explicando que chrome.runtime.reload vuelve a cargar los archivos de la carpeta instalada; no descarga ZIP ni reemplaza archivos. Confirmar descarta la conexión/borrador y recarga la extensión. Worker restaura una única pestaña del panel en onInstalled(update), reutilizando la existente o abriendo una si Chrome la cerró. Instalación inicial no abre el panel. Juego se recarga manualmente y Play permanece manual.

- [x] Header, CSS y selector de secciones desde Renderer.
- [x] Diálogo de actualización y retorno al panel sin recargar juego automáticamente.
- [x] Prueba aislada: selección, scroll desktop/móvil, cancelar y confirmar actualización, sin comandos automáticos.
- [x] Documentación, release local conjunta y hashes del ZIP.

Validación de actualización: el paquete transitorio cargado por argumentos del navegador de prueba se descarga al ejecutar runtime.reload y no regresa. La suite comprueba la solicitud nativa y la restauración del panel por separado, con evento simulado. La recarga completa en una instalación habitual de Chrome queda pendiente; no se operó la instalación del usuario.
