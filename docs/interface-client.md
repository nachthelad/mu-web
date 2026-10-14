# Interfaz 1.1.1 · barra clásica adaptable

El 2026-10-07 el usuario confirmó después de importar: «Se ve bien». Confirma el resultado visual instalado del marco; no constituye prueba exhaustiva de todos los handlers, escalas y variantes en partida real. Release completada con 129 pruebas de lógica y 14 suites de interfaz.

1.1.1 corrige la diferencia entre la propuesta y la textura repetida de 1.1.0. Usa `ornate-frame-generated.png` (referencia: propuesta visual aprobada), exportada a `ornate-frame.webp`, 576×96, 23010 bytes embebidos. Dos paneles `.mui-side-frame` usan border-image, cortes laterales de 92 px y remates fijos de 46 px virtuales; solo el cuerpo interior se adapta. No repite rombos. Sin cambios del bloque central ni de controles.

`scripts/render-interface-reference.cjs` muestra el CSS de los paneles sobre la captura instalada que entregó el usuario. `interface-ornate-reference-preview.png` conserva la barra central y el botón de chat de esa captura. Es un montaje estático verificable, no prueba de 1.1.1 en partida real. Las demos ilustrativas siguen comprobando DOM y eventos.

Coordenadas, orbes y controles agrupados en el centro. Posiciones nativas del bloque izquierdo reciben +45 px; bloque derecho −40 px; después todos reciben el mismo desplazamiento para centrarse. El marco se recorta en x0–160, x200–437 y x477–640: conserva los pozos e iconos originales sin superponer las pociones. Se reserva un margen lateral de hasta 56 px al calcular la escala para liberar el toggle del chat en anchos pequeños. La captura del usuario confirmó la presentación instalada de 1.0.0; los cambios de 1.1.0 se verificaron en demo.

La textura anterior `metal-frame-generated.png` y su WebP se conservan como referencia de 1.1.0. `scripts/build-interface-texture.cjs` ahora exporta la placa ornamental, recorta el margen negro externo y la incorpora dentro del userscript; al cambiar arte ejecutar el script antes de incrementar versión/publicar. Sin URL externa ni archivo adicional en dist.

Script independiente: `src/interface/interface.user.js`, instalable generado `dist/interface.user.js`. Solo presentación; no accede a Store ni envía comandos. No requiere otros módulos. Desactivar Interfaz y recargar restaura la barra del juego.

Revisado el 2026-10-07 sin cuenta en [cliente desplegado](https://mu.mormon.garden/): `index-BP4r5LRo.js` y `index-BG8eelyE.css` contienen `.v097d-bottom-bar`, variante usada por la captura. Dimensiones virtuales 640×93, dragones `.v097d-corner` a Y=0; marco `.v097d-tile` a Y=45, altura 48. Tiles Menu01_new.OZJ (256), Menu02.OZJ (128), Menu03_new.OZJ (256).

Orbes nativos `.v097d-fill`, HP x97 y MP x489, 53×48; AG x551. Números y coordenadas son spans `.v097d-digit`. Pociones Q/W/E x208/239/270, clic derecho nativo; skill actual x304, selector `.v097d-skill-slot`; Party/Personaje/Inventario x348/379/410 y Guild x582. La variante moderna `.bottom-bar` se conserva intacta.

Fondo continuo a todo el ancho, escala nativa conservada si cabe con margen para chat. Sprites sin estiramiento horizontal. Se ocultan dragones y grip de esta barra; Interface size del juego puede seguir cambiando su escala. Copias exclusivamente decorativas de tiles conservan marcos, rótulos e iconos de menú. Controles, fills y números originales conservan eventos. Bloque compacto central, textura en los laterales. Selector largo en filas; tamaño nativo conservado.

Observa montaje React, estilos y resize sin intervalos ni datos de cuenta. Evento local `mu-interface:toggle`, detail `{enabled:boolean}`, activa/desactiva la presentación durante diagnóstico. Sin preferencias persistentes ni acciones HUB.

`tests/interface-ui.cjs`: 360/480/640/1024/1440/1920 px, escala 1.5/2, ancho completo, controles dentro del viewport, handlers, selección, 35 skills en compacto, actualización de fill/número, desactivar/reactivar, reemplazo de barra y variante desconocida. Capturas `docs/screenshots/interface-wide-preview.png` y `interface-compact-preview.png`.

La demo reproduce DOM y coordenadas verificados con gráficos ilustrativos. No equivale a prueba con sprites en partida real. Depende de las clases y dimensiones actuales del cliente. No se instaló en Tampermonkey.
