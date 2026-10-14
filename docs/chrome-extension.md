# Chrome local · MU

## Panel externo (2026-10-10)

El paquete nuevo abre/enfoca **Centro de control** al hacer clic en su icono. Elegir la pestaña de MU y Conectar. Configuración, Radar/historial y Analytics se muestran allí; el juego queda sin HUB ni ventanas de ajustes. Minimapa opcional. Los motores y datos permanecen en el juego. [Uso, protocolo, permisos y límites](extension-panel.md).

El worker solo abre/enfoca y enruta mensajes. Hay adaptador MAIN en document_start, seis módulos MAIN en document_idle y puente ISOLATED en document_idle. Se agrega permiso de host exclusivamente para el origen del juego. La sección siguiente describe la distribución inicial sin panel; sus evidencias históricas no reemplazan las pruebas del panel nuevo.

## Compartir el ZIP

El conjunto vigente se puede empaquetar sin cambiar versiones mediante `npm run share:extension`. Genera `dist/mu-web-chrome-<versión>.zip` y su checksum `.zip.sha256` después de verificar los hashes del release vigente; no toma cambios pendientes de src. El ZIP incluye solo `chrome-extension/` e `INSTALAR.txt`, sin sesiones, preferencias personales ni el resto del proyecto. Releases y rollback también generan el ZIP junto al paquete. Para instalarlo hay que descomprimirlo y seleccionar la carpeta chrome-extension mediante Cargar descomprimida.

## Instalar, actualizar y volver

Requiere Chrome 120+. Desactivar los seis userscripts antes de usar la extensión. En `chrome://extensions`, activar Modo desarrollador, elegir Cargar descomprimida y seleccionar `D:\Cosas\Dev\mu-web\dist\chrome-extension`. Recargar el juego cuando se pueda interrumpir la partida.

Cada `npm run release` genera userscripts y extensión juntos. Para actualizar una extensión ya cargada, recargarla desde chrome://extensions y después recargar el juego. No borrar o mover su carpeta mientras esté cargada. El paquete no tiene actualizaciones automáticas.

Para regresar, desactivar la extensión, reactivar exactamente un userscript por módulo y recargar. Ajustes e historiales pertenecen a localStorage del origen del juego y se reutilizan en ambos formatos. No se cambia su formato ni se copian a chrome.storage. Los respaldos de release no incluyen datos del navegador.

## Arquitectura y límites

Seis scripts declarativos MAIN en document_idle, solo `https://mu.mormon.garden/*`, documento principal. Radar → Helper → Config → Analytics → Interface → HUB. Las fuentes se copian byte por byte. HUB conserva sus hosts y listeners originales; las marcas de instancia previenen otra inicialización por módulo incluso dentro de Shadow DOM. Scripts antiguos sin las marcas no tienen esa garantía: desactivar Tampermonkey sigue siendo obligatorio.

No hay popup, worker, permisos de APIs adicionales ni dependencias remotas. La pestaña contiene los ciclos y debe permanecer abierta. El navegador puede retrasar temporizadores al ocultarla, suspenderla o descartarla, igual que con los userscripts; no se promete ejecución permanente en segundo plano.

Chrome permite MAIN y orden declarativo; comparte variables con la página y aplica su CSP. Referencias oficiales: [content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), [manifiesto](https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts). No se debilita ni modifica la política del servidor. Una política futura que prohíba estilos inline o imágenes data puede impedir partes de la interfaz.

Consulta pública sin cuenta del 2026-10-07: GET de `https://mu.mormon.garden/` devolvió HTTP 200 sin Content-Security-Policy, Content-Security-Policy-Report-Only ni meta CSP en el HTML recibido. Es evidencia de esa respuesta, no una garantía sobre otras rutas, respuestas posteriores o una sesión real.

## Evidencia y reproducción

`node tests/extension-ui.cjs` construye un paquete temporal desde fuentes, lo carga realmente en Chromium con perfil desechable e intercepta la URL del juego. Todas las respuestas son fixtures locales; se abortan solicitudes de recursos externos. No hay cuenta ni sesión real. Para comprobar el paquete entregado: `node tests/extension-ui.cjs --package dist/chrome-extension`.

La prueba cubre MAIN, alcance HTTPS, seis hosts únicos, montaje original, carga en ambos órdenes con userscripts vigentes, listeners/intervalos/comandos sin duplicación, carga alternativa, Config Guardar/Cancelar, persistencia con claves v1 reales sobre origen simulado, Play/pause, eventos Analytics, estilos y decodificación de textura bajo CSP del fixture. Las quince suites previas siguen siendo obligatorias.

La captura y el registro de navegador, versión y hashes se generan en `artifacts/chrome-extension-demo.png` y `artifacts/chrome-extension-validation.json`. Las pruebas de lógica cubren manifiesto, bytes y hashes, releases por módulo, retención, corrupción, carreras, promoción fallida y rollback histórico.

Entrega inicial del 2026-10-07: release `2026-10-08T01-00-02-804Z-0b9b16`, extensión 1.0.0. Aprobaron sintaxis, 133 pruebas de lógica y las 16 suites de navegador. La carpeta final de dist también se cargó y probó directamente en Chromium 151.0.7922.34; fuentes, userscripts, paquete y archivo de release se verificaron por hash. SHA-256 agregado del paquete: `f05ce33403019164c0ea9734b5c07cac6bbe720ad041ec164a9b17b7e35a2388` (hash de la lista ordenada de hashes, no de un ZIP).

La prueba en Chromium confirma el paquete cargado en ese entorno. No confirma instalación en el Chrome habitual, políticas de otras respuestas del sitio ni funcionamiento en partida real. No se instalaron extensiones en perfiles habituales ni se modificó Tampermonkey.
