# Centro de control externo

## Distribución amplia · opción A (2026-10-10)

La barra superior conserva estructura, navegación y comportamiento sticky. Debajo, el contenido usa el ancho de la ventana con márgenes comunes, sin una card exterior ni cards por spot/destino. El título identifica la sección seleccionada. Abrir configuración vuelve a mostrarse cuando el formulario está cerrado.

Release local de este revamp: extensión **1.0.22**, conjunto `2026-10-10T23-39-29-623Z-74dfbd`, ZIP `dist/mu-web-chrome-1.0.22.zip`. Sintaxis, 178 pruebas de lógica y todas las suites de interfaz del proceso oficial aprobadas. Los seis módulos conservan sus versiones y hashes de la extensión 1.0.21: solo cambia la presentación externa. Evidencia completa en `artifacts/ui-revamp/release.log`.

El paquete final `dist/chrome-extension` también pasó los 19 grupos funcionales de `extension-panel-ui.cjs --package`; log en `artifacts/ui-revamp/package-verification.log`. SHA-256 del ZIP: `06e3269b916ecd0a578e86132a156ac2db87c847b913f3b469aab10003ddce0e`.

Leveleo muestra selector de mapa, habilitación y nivel en una fila adaptable, spots con X/Y y acciones en filas, y progresión/Reset/Soul Shield al costado. Obtener separa categorías/nombres y rango/ayuda. Visualización pone Trackeo y Estilos en columnas. Party y Estadísticas conservan sus pocos controles en filas simples; las capturas A/B siguen en C dentro del juego.

En ventanas angostas las columnas se apilan y las acciones se reorganizan. Las reglas de presentación viven en panel.css y en el CSS externo de renderer.js: no se reparentan ni duplican controles y no cambia el árbol canónico. Guardar/Cancelar, guardado automático, rollback, sesiones y standalone conservan su comportamiento.

Evidencia local: `artifacts/ui-revamp/before-*.png`, `after-*.png` y métricas JSON. Seis secciones con los mismos datos a 1920×1080, 1360×1000 y 390×844; comprobaciones adicionales a 900 y 320 px de ancho. La suite `tests/extension-layout-ui.cjs` prueba límites horizontales de página y controles, resumen lateral, títulos, foco incremental, teclado y recuperación legacy; forma parte del release. No se probó en partida real.

## Barra superior

Conectar/Desconectar vincula o desvincula el panel de la pestaña elegida. Desconectar descarta el borrador y deshabilita los controles del panel; no pausa Play ni los motores. La flecha ↻ es Reconectar: renueva el vínculo con la pestaña elegida, descarta cambios sin guardar y vuelve a abrir la vista. No recarga el juego ni inicia/pausa Play. La lista de pestañas se actualiza al enfocar el panel o el selector, y antes de reconectar. Anteriormente la flecha solo enumeraba pestañas bajo el nombre Actualizar pestañas.

La navegación, pestaña/conexión, selector de secciones y Play/Pausa quedan visibles al scrollear. El selector de secciones proyecta los cinco botones originales de Helper, sin duplicar su lógica ni sus motores. Si Config estaba cerrada, elegir una sección vuelve a abrirla; cambiar de sección conserva el borrador. El diseño se adapta a ventanas angostas.

**Actualizar extensión** muestra la versión instalada y abre un diálogo. Para aplicar un ZIP nuevo, primero reemplazá los archivos de la carpeta instalada. Confirmar **Recargar extensión** usa chrome.runtime.reload: descarta el borrador, desconecta el panel y vuelve a cargar sus archivos locales. No descarga versiones ni reemplaza archivos. Cancelar/Escape conservan la conexión y el borrador.

Después recargá el juego manualmente cuando puedas interrumpir la partida y conectá de nuevo. Los motores ya inyectados siguen en el documento anterior hasta esa recarga; Play nunca se inicia automáticamente. El worker restaura una única pestaña de panel al recibir onInstalled(update), reutilizando la existente si Chrome la conservó. Una instalación inicial no abre el panel automáticamente; el juego no se recarga.

## Uso

Los switches de spots, Usar este mapa, Reset automático y Soul Shield se guardan al cambiarlos, sin pulsar Guardar. Cancelar conserva esos cambios inmediatos. Coordenadas y niveles siguen requiriendo Guardar; para cambiar por separado el switch de un spot nuevo o editado, guardá primero sus coordenadas. El estado informa Guardando, guardado o No guardado. El panel proyecta la misma lógica del Helper, sin otra copia de preferencias.

1. Recargar la extensión desde chrome://extensions y luego el juego cuando puedas interrumpir la partida. Mantener desactivados los seis userscripts si usás la extensión.
2. Clic en el icono de MU abre o enfoca una sola pestaña **Centro de control**.
3. Elegir la pestaña del juego por su número/título y pulsar **Conectar**. La cabecera muestra mundo/cuenta y personaje; no se elige otra sesión silenciosamente.
4. Configurar Leveleo, Obtener, Party, Visualización o Estadísticas. Guardar valida y aplica con rollback original; Cancelar descarta. Guardar no inicia Play.
5. Play/pausa y minimapa opcional están en la cabecera. Radar/historial y EXP por spot tienen vistas propias. Activar Estadísticas detalladas muestra el detalle automáticamente al abrir C manualmente en el juego para capturas A/B; no hay botón Detalle en C. Ambos switches de Estadísticas se guardan al cambiar. Ayuda en «?» con mouse, foco/Enter o toque; esta sección no requiere Guardar ni Abrir configuración y queda accesible tras Escape. Ese contenido nativo y los cambios visuales siguen aplicándose sobre el juego.

En las demás secciones, cerrar la configuración después de Guardar/Cancelar deja el botón **Abrir configuración**. Cambiar de vista conserva el borrador mientras siga la misma conexión. Cambiar de destino, reconectar o cambiar la identidad descarta el borrador anterior. Después de una desconexión se requiere Conectar; no se reenvían acciones.

Escape en el panel cancela Config. Config 1.3.1 deja de interceptar Escape dentro del juego cuando la presentación es externa; el atajo standalone continúa igual.

Cerrar el panel no pausa Play ni Analytics. Cerrar/recargar el juego termina ese documento y los motores de la nueva carga comienzan pausados. El minimapa se oculta al recargar, sin alterar la posición guardada. Chrome puede retrasar, congelar o descartar pestañas ocultas: el panel no garantiza ejecución permanente en segundo plano.

## Fuentes y responsabilidades

`src/extension` contiene los únicos assets editables del panel. El generador los agrega a los mismos seis módulos canónicos y registra sus hashes. No hay servidor local ni dependencias remotas. Tampermonkey mantiene sus ventanas originales: el adaptador externo solamente se carga mediante el manifiesto de extensión.

- `worker.js`: apertura/enfoque y enrutamiento por tabId. Reiniciarlo no reinicia motores ni conserva una cola de acciones.
- `content-bridge.js`: mensajería de extensión en ISOLATED; solicita operaciones al adaptador MAIN y aplica timeout sin repetirlas.
- `page-bridge.js`: registra los módulos originales mediante contrato v1, oculta su presentación en el juego y proyecta sus vistas. Nunca crea ciclos, ni envía comandos propios del juego.
- `renderer.js`: construye DOM permitido, sin innerHTML remoto, scripts, listeners o URLs externos. Conserva nodos y foco al recibir actualizaciones.
- `panel.html`, `panel.css`, `panel.js`: navegación, destino explícito, estado y controles; lectura de la vista seleccionada una vez por segundo mientras el panel está visible.

El formulario original continúa en el documento del juego, oculto. El panel proyecta estructura y valores de esos controles, y remite eventos acotados a sus nodos vigentes. Conserva foco, edición pendiente y selección del cursor para quitar la línea de loot elegida; Enter permite saltos de línea en el textarea y agrega un nombre desde su entrada específica. Es una vista de los mismos proveedores: no mantiene una copia editable de la configuración ni reimplementa reglas de rutas, loot o perfiles. El canvas del Radar se transmite como imagen del dibujo original. Las diferencias por nodo evitan reenviar estilos e historiales completos en cada lectura. Solo se captura la vista seleccionada; hay límites de tamaño y cantidad de nodos.

## Protocolo v1 y sesión

Operaciones permitidas: hello, connect, disconnect, read/open para Config/Radar/Analytics; action para Play/overlay; event para click, input/change de formulario y Enter. La visibilidad de estadísticas depende del switch detallado y C abierta. Los eventos solamente apuntan a IDs opacos de controles serializados de los hosts conocidos. No se admiten selectores, código, comandos libres ni acceso genérico a almacenamiento.

Cada documento tiene un UUID y cada cambio observado de mundo/cuenta/servidor/personaje incrementa su generación. Conectar asigna una lease nueva e invalida cualquier conexión anterior. Toda operación lleva generación/lease y el worker dirige la solicitud a una pestaña y frame concretos. Identidad desconocida bloquea las escrituras e inicio mediante las reglas originales de Helper. Las respuestas anteriores se descartan en el panel. Un timeout se informa como resultado incierto, sin reenvío automático.

Las identidades transmiten solamente mundo, nombre de cuenta, personaje y host de servidor; nunca el token completo accountFor, contraseña ni almacén de credenciales. Las preferencias/historiales siguen en localStorage del juego, con las claves actuales y protección por cuenta/Web Locks. No se migra a chrome.storage.

El puente MAIN/ISOLATED comparte el documento con el cliente: es un adaptador local, no una frontera de seguridad frente a código hostil que ya controla la página. El worker solo acepta solicitudes desde su panel exacto, el contenido aislado no ofrece APIs Chrome al cliente y la extensión no tiene permisos para otros sitios. El renderer filtra tags/atributos y su CSP impide scripts, objetos y conexiones remotas.

Analytics 1.1.4 agrega actions.clearHistory(confirmed) para que la confirmación de borrado se muestre en el panel en vez de la pestaña oculta. El botón standalone conserva su confirmación. También permite iniciar una medición desde el panel aunque la pestaña del juego esté oculta; conserva condiciones, eventos y temporizador originales.

## Permisos y distribución

Se agrega action, background.service_worker y host_permissions limitado a https://mu.mormon.garden/*. No se solicitan tabs, scripting, storage, downloads ni permisos globales. El worker usa el acceso al origen permitido para enumerar el juego y enfoca su propia página de extensión.

El generador verifica hashes históricos con los assets archivados para que un cambio futuro del panel no invalide rollback. Release vigila los assets de src/extension además de fuentes/generadores/tests; se genera ZIP con instrucciones. No editar dist ni releases.

Referencias consultadas: [action](https://developer.chrome.com/docs/extensions/reference/api/action), [mensajería](https://developer.chrome.com/docs/extensions/develop/concepts/messaging), [vida del worker](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle).

## Validación

`node tests/extension-panel-ui.cjs` carga una extensión real en Chromium con perfil temporal, URL del juego interceptada y sin conexiones al servidor. `--package dist/chrome-extension` prueba el paquete generado. La suite forma parte de release junto con regresiones de motores, ventanas standalone y transacciones.

Evidencia: artifacts/chrome-extension-panel-validation.json, chrome-extension-panel.png, chrome-extension-panel-mobile.png y chrome-extension-game-clean.png. Las capturas son simulaciones. Instalación en Chrome habitual y partida real siguen pendientes del usuario.

## Entrega verificada

Extensión **1.0.13**, Config **1.3.1**, Analytics **1.1.4**; conjunto `2026-10-10T11-36-24-443Z-22a04e`. Release completo aprobado: sintaxis, 162 pruebas de lógica y todas las suites de interfaz. Se probó además la carpeta final de dist directamente, con los 15 grupos del panel aprobados en Chromium 151.0.7922.34. Hashes de los 14 archivos del paquete y de las fuentes comprobados contra manifest.

- ZIP: `dist/mu-web-chrome-1.0.13.zip` y su `.sha256`.
- SHA-256 del ZIP: `30a57081b7b9f053d69e093d1a95f2f263746c65e6cf0ad08bedecd94d95a768`.
- Hash agregado del paquete: `cdfa258ccbc1472279678d1c21aa50869a463044a3ceb2a4fedcba517a2328db`.
- Logs: `artifacts/extension-panel-release-verified.log` y `artifacts/extension-panel-package-verification.log`; resumen `artifacts/extension-panel-delivery.json`.

Las primeras iteraciones y el release 1.0.12 quedan como evidencia local. Una validación intermedia se detuvo correctamente por cambios de fuentes durante la revisión final; el conjunto 1.0.13 se generó después con todas las fuentes estables y se volvió a verificar sin cambios de código.

Validación de actualización: el paquete transitorio cargado por argumentos del navegador de prueba se descarga al ejecutar runtime.reload y no regresa. La suite comprueba la solicitud nativa y la restauración del panel por separado, con evento simulado. La recarga completa en una instalación habitual de Chrome queda pendiente; no se operó la instalación del usuario.

Detección del panel: runtime.getContexts consulta únicamente documentos TAB de esta extensión. Evita depender de tabs.query por URL de extensión, cuyos campos de URL se ocultan sin permisos globales de pestañas. No se agregan permisos; los destinos de juego siguen limitados al origen autorizado.

## Retiro de Golden hunt · 2026-10-11

Se retiran G y Goldens. El puente rechaza action gold como no disponible y no serializa el formulario histórico. Helper mantiene actions.gold como respuesta inerte compatible y ready false. El motor histórico y sus preferencias se conservan para recuperación, sin entrada de activación ni listener de cacería. No cambia contrato v1 ni almacenamiento. El listado de cantidades de Radar sigue independiente de Play y de la visibilidad del minimapa.

La suite golden-retired-ui reemplaza las tres suites de cacería publicable (golden-hunt, golden-config, golden-late-invasion); sus pruebas de motor puro permanecen como cobertura histórica. Se mantienen las suites del contador, perfiles, transacciones, extensión y leveleo.

## Caza del Balrog · Helper 1.27.0

La sección Caza proyecta el switch balrogEnabled y el Play/Pausa original del Helper. Su overlay independiente permanece en el juego cuando hay ubicación vigente y la función está habilitada. Home se activa al llegar y Pausa espera detenerlo antes de liberar uso manual. El puente conserva protección de sesión/borrador y sigue rechazando gold. No se agregan motores ni comandos al panel. Ver balrog-client.md.

## Party · Helper 1.28.0

La sección Party proyecta sendParty y sendPartyOutside como controles independientes con Guardar/Cancelar. Terceros está apagado por defecto; ambos esperan 2 segundos de presencia cercana observada y respetan los límites previos. La ayuda compacta se transmite desde el formulario original, sin nuevo motor ni preferencias duplicadas. Solo clanes confirmados; ver party-guild.md.
