# Estadísticas · Helper 1.29.3

mountStats solo modifica statsHost/statsPanel. No conserva ni restaura estilos de C/V ni escribe posiciones nativas. Mide el rect/escala de C para encajar el detalle adjunto; el cliente conserva arrastre, bloqueo y almacenamiento de ventanas.

La visibilidad depende exclusivamente de detailedStats, sesión válida y C abierta. No se ofrece capability.actions para el gráfico ni toggle separado. getState().statsVisible informa el detalle realmente montado; el puente rechaza la acción stats antigua. El refresh y las preferencias existentes conservan la responsabilidad.

StatsComparison conserva snapshots de equipo solo para condiciones de A/B; el host visible muestra métricas y controles de comparación. detailedStats y pairInventory usan la cola de autoguardado y AccountSettings existentes. Las bases de begin/rollback se actualizan después de una escritura confirmada; Cancelar no revierte esos switches. El renderer solo adapta presentación del formulario original, incluida ayuda accesible y ocultación de footer en Estadísticas. Todos los builds auditados usan el hook limitado de C/V cuando el switch está ON; se retiró el bypass incorrecto de 1.29.0. [Detalle](character-stats-client.md).

# Caza del Balrog · Helper 1.27.0

Caza incorpora balrogEnabled opcional en preferencias v1 por cuenta, autosave y controles originales proyectables. Helper conserva scheduler, NativeHelper y cola; pausa leveleo, confirma llegada y activa Home. Pausa espera detener Home y libera control manual. actions.balrog/getState().balrog son opcionales; HUB no agrega motor. Destino por anuncios auditados y recuperación del build público conocido. Golden hunt sigue inerte. [Evidencia y pruebas](balrog-client.md).

# Estado vigente: Golden hunt retirado (2026-10-11)

Helper 1.24.2 / HUB 1.4.7 retiran la cacería publicada y sus controles. actions.gold responde available:false y getState().gold.ready es false. Preferencias y clases históricas se conservan inertes, sin listener reactivo ni entrada de activación. El contador informativo de Radar continúa activo durante invasiones. Las referencias siguientes a cacería describen el diseño histórico, no instrucciones de uso vigentes.

## Centro de control: barra superior fija

Header sticky para navegación, destino/conexión, selector de secciones originales y controles de partida. Renderer expone sus pestañas originales y reenvía la selección al mismo botón canónico; oculta solamente su presentación repetida dentro del formulario. No agrega motores, comandos ni claves de ajustes. Actualización explícita usa runtime.reload, con diálogo para descartar el borrador y recargar juego manualmente. Worker restaura una única pestaña en onInstalled(update). [Uso y límites de validación](extension-panel.md).

## Helper 1.23.0: progresión por mapas

El renderer del panel invalida IDs retirados antes de quitar nodos enfocados, evitando eventos change de controles vencidos al cambiar de mapa.

Preferencias v1 agrega opcionalmente leveling v1, con los 26 destinos y spots X/Y por mapa. MapVisit decide una selección estable por etapa dentro de Cycle; no agrega temporizadores ni comandos propios. Se conservan claves por cuenta y campos de rutas como respaldo recuperable. La edición sigue begin/validate/apply/rollback/discard de Config, también proyectada por el panel MV3. [Contrato y comportamiento](level-routes.md).

## Helper 1.20.2 · Pasos de leveleo opcionales

Cada paso tiene un toggle: apagarlo conserva mapa, nivel, coordenadas y orden, y lo omite del recorrido después de Guardar. Debe quedar al menos un paso activo. Las rutas anteriores sin enabled mantienen todos sus pasos activos.

# Patrón de interfaz para addons de MU

## Helper 1.18.1: mínimos por clase

`playerData.charClass` usa CharacterClassNumber del cliente (MG 12, Duel Master 13); no confundir con IDs de PlayerClass o BaseClass. El catálogo MG se transcribe de la captura del usuario: mínimos en LEVEL_MAPS permanecen generales y minimumLevel resuelve la clase. La carga persistida permite el mínimo MG para conservar rutas recuperables; el guardado y el inicio del ciclo exigen los mínimos de la clase activa. No se modifican niveles elegidos automáticamente ni almacenamiento/contrato. Goldens y precarga usan el mismo resolver. Otras clases continúan con sus mínimos generales.

## Helper 1.18.0 y Config 1.3.0: perfiles por cuenta

Migración explícita: Helper usa claves por mundo/cuenta con contenido v1; la clave global anterior queda intacta para importación con Guardar/Cancelar. La identidad se resuelve desde el cliente autenticado, nunca desde el personaje. Config espera apply/rollback asíncronos bajo Web Locks; actualizar ambos módulos juntos. Conserva eventos/registro v1, hosts y motores existentes. Alcance, decisiones y límites en [configuración por cuenta](account-settings.md).

## Distribución Chrome local · contrato v1 conservado

La extensión MV3 ejecuta los mismos archivos en MAIN, document_idle, orden Radar → Helper → Config → Analytics → Interface → HUB. No usa background, popup, chrome.storage ni un puente de mensajes adicional. Todos los motores y las transacciones existentes permanecen en la pestaña; el contrato por CustomEvent y las claves de localStorage no cambian.

Cada módulo añade una marca de instancia por documento con `Symbol.for('mu.addons.instance.<módulo>.v1')`, además del guarda de host. La marca no se persiste ni forma parte del contrato de registro. Evita una segunda inicialización aunque HUB haya movido el host dentro de su Shadow DOM, donde document.getElementById no lo encuentra. Recargar crea un contexto nuevo. Usar siempre un solo formato activo; scripts antiguos sin esta marca pueden duplicarse si se dejan habilitados.

MAIN comparte el contexto del cliente y está sujeto a la CSP de la página. Se conserva CSS y texturas embebidas; no se altera la CSP del juego. Las pruebas de extensión usan una CSP de fixture con scripts por nonce, estilos inline permitidos, imágenes data y conexiones bloqueadas. Ese resultado no confirma la política efectiva futura del servidor.

## Interfaz independiente 1.0.0

Solo presenta la barra nativa clásica, sin motores, comandos ni cambios del contrato v1. Conserva los nodos originales y no registra controles duplicados en HUB. Observación DOM y resize propios sin intervalos; los scripts existentes siguen aislados. Detalles en [Interfaz](interface-client.md).

## Arena y tracking persistente · Helper 1.15.4 / Radar 1.8.1

El catálogo desplegado asigna Arena 2/3/4 a mundos 83/84/85; comparten assets de Stadium, pero no identidad de mapa. Helper usa esos IDs tanto para llegada como para precargar pasos, incluso después de un viaje manual. Esta corrección sustituye la suposición anterior de mapa 6 compartido.

Radar guarda `{version:1,whiteWizard:boolean,redDragon:boolean}` en `mu.golden-radar.settings.v1` (demo: `mu.golden-radar.demo-settings.v1`). Ambas preferencias siguen apagadas sin registro previo. Config usa el proveedor transaccional existente: begin captura almacenamiento, apply persiste, rollback restaura y discard repuebla. Sin Config se guardan al cambiar. No se modifican claves de historial o posición; tracking de dorados sigue por sesión. Esta persistencia sustituye la descripción anterior de White Wizard/Red Dragon por sesión.

## Foco de HUB · 1.4.2

Los botones de la barra previenen el foco por pointerdown primario y liberan el foco residual propio en clics de pointer. Se conserva el elemento del juego previamente enfocado; no se buscan ni manipulan sus inputs. Config puede enfocar sus controles al abrirse, pero su retorno de foco ya no registra como destino un botón que se acaba de pulsar con mouse. La navegación deliberada por teclado conserva el comportamiento estándar y los indicadores focus-visible. No se cambian preferencias, motores ni el contrato v1.

## Recuperación de invasión activa · 1.15.1 / 1.7.1 / 1.4.1

Radar puede recuperar el evento y cantidades desde el texto actual y title de la fila Golden Invasion, además de paquetes. La antigüedad del snapshot HUD solo se renueva si cambia el contenido; las cantidades conservan el límite de 60 segundos. El estado activo idéntico vence a los 15 minutos, igual que la retención del cliente público. Los paquetes nuevos tienen prioridad inmediata sobre el HUD durante su actualización.

Goldens acepta hasta seis destinos únicos, incluyendo Noria. No se agrega a rutas guardadas ni a la ruta predeterminada: se elige con Agregar mapa. La capacidad y almacenamiento siguen en v1. Helper ofrece el motivo real de espera en `gold.message`; HUB lo presenta, manteniendo la compatibilidad con módulos anteriores.

## Goldens configurables · Helper 1.15.0 / Radar 1.7.0

Helper añade `soulShield` booleano opcional (true por defecto) y `gold` opcional a `mu.level-helper.settings.v1`. `gold` contiene `anticipate`, `pendingMaps`, `sweep`, `saveSpots`, `visitSpots`, `kundun` (booleanos, todos true), y `route` (1–5 filas únicas `{map, level, enabled}`). Los IDs permitidos son los cinco destinos existentes; mínimos del catálogo M hasta 400. Se permiten todas las filas deshabilitadas. La ruta y opciones se capturan al preparar cada evento; no cambian la cacería ya iniciada. Soul Shield sí reacciona al ajuste actual. La demo conserva clave separada.

Radar añade `actions.captureSpots(boolean)`; solo controla nuevos `Archive.observe`, sin borrar registros ni detener Tracker. Helper sincroniza desde su refresh existente. `huntingData()` añade `timerAvailable` y `remaining` (null o `{status,total,maps:[{map,alive}],at,eventId}`). Evento admite `scheduled` con `startsAt`, leído del contador visible. La preparación conserva identidad cuando llegan avisos o InvasionMonsters. Helper considera mapas restantes por 60 segundos y únicamente para el evento asociado; un mapa omitido del paquete es desconocido.

Play apagado cancela cacería y buff, conservando G armado. Soul Shield utiliza skill 16 / efecto 4; espera hasta tres segundos la confirmación y reintenta como máximo cada diez segundos. Solo modifica su propia solicitud de cast y restaura la skill anterior si sigue seleccionada Soul Shield. Home maneja el buff cuando está activo y lo tiene configurado. Las advertencias se muestran en Leveleo y en el estado del HUB. No se agregan intervalos a los módulos.

Golden hunt reactivo conserva contrato v1. `radar.actions.huntingData()` agrega `map`, `seen`, `live` y `recent` (filas de Tracker: id, type, observation, x/y, seen). Radar emite `mu-radar:hunting` después de actualizar el snapshot desde su tick existente; `detail.seen` permite medir la reacción. Helper consume el snapshot y posee navegación/combate/loot. Un Radar sin snapshot nuevo no habilita G en Helper 1.10.1. `helper.getState().gold` agrega contadores `kills` del mapa actual y `boxes`; HUB no necesita motor ni cambios.

Usar como referencia al crear o modificar addons de este proyecto. Implementaciones: `src/helper/level-helper.user.js` y `src/radar/golden-radar.user.js`.

## Contador de invasión · Radar 1.9.1

Host `mu-golden-counter` independiente en body, Shadow DOM y actualización desde tick de Radar, sin nuevo scheduler. No lo monta HUB ni lo oculta page-bridge. El desglose se muestra en filas visibles de mapa/cantidad con scroll interno, conservando ceros explícitos; ausencia de filas vigentes indica Sin datos por mapa. Estado nativo de invasión, total y mapas del lector existente; nunca avistamientos. Vence a 60 segundos para paquetes y 15 minutos para HUD sin cambios, sin renovar timestamp al renderizar. Oculto fuera del evento activo; datos desconocidos se presentan como Sin datos. Identidad de cuenta/mundo/servidor/personaje invalida la lectura anterior; HUD idéntico queda bloqueado hasta cambiar o recibir paquete nuevo. Posición/candado en `mu.golden-radar.counter-position.v1`, demo en clave separada, sin persistir cantidades. Resize limita posición al viewport. Prueba `tests/golden-counter-ui.cjs` y captura `docs/screenshots/golden-counter-preview.png`; partida real pendiente.

## Estructura

Helper 1.24.0: auto-reset, soul-shield, map-enabled y spot-enabled son inputs nativos role=switch con ON/OFF visible. Guardan parches acotados en el perfil existente mediante la protección de cuenta/Web Locks y comparación de bytes; no serializan el resto del borrador. La cola de switches se espera antes de apply. La base de la transacción se actualiza tras guardar cada switch para que Cancelar y rollback de un Guardar posterior lo conserven. Coordenadas/niveles siguen transaccionales; un spot con estructura o coordenadas pendientes no admite parche por índice hasta Guardar. Sin nuevos temporizadores ni comandos. page-bridge/renderer proyectan los mismos inputs y estilos.

- Barra compacta con hasta tres acciones principales: acción del addon, función secundaria y engranaje.
- Iconos SVG, sin instrucciones permanentes en la barra. Cada botón tiene `aria-label` y `title` que explican su acción actual.
- Engranaje abre un panel informativo y de configuración, cerrado inicialmente. Usar `aria-expanded`, `aria-controls` y `hidden`.
- El panel muestra estado, configuración efectiva y límites relevantes. Cambiar un ajuste no inicia acciones automáticamente.
- Una visualización principal, como el minimapa, puede permanecer visible. Historial y ajustes se despliegan por separado.

## Apariencia

| Elemento | Valor |
| --- | --- |
| Fondo | `#15170ff2` |
| Texto | `#eee6d1` |
| Iconos y títulos | `#e7c780` |
| Borde | `#76633d` |
| Activo | texto `#c1e7a0`, borde `#a4c880` |
| Texto secundario | `#aeb6a0` |
| Tipografía | Verdana, sans-serif; 12 px |
| Botón flotante | 44 × 44 px, circular |
| Botón dentro de barra del mapa | 32 × 32 px, circular |
| Separación de botones | 6 px |
| Panel | 280–288 px, radio 8 px, padding 12–14 px |
| Icono | SVG de 18–20 px, `aria-hidden="true"` |

## Comportamiento

- Play/pause: `aria-pressed` representa si el ciclo está activo. Pausar cancela acciones propias y solicitudes pendientes.
- Función secundaria: toggle independiente, apagado al iniciar. Su configuración indica dónde y cuándo actúa.
- Activo usa verde; no disponible usa menor opacidad y `disabled`. No depender solo del color: acompañar con icono o estado en el panel.
- Ocultar o contraer solo cambia la interfaz: el monitoreo puede seguir ejecutándose. Distinguirlo de pausar.
- No cerrar ni eliminar el addon por accidente con un botón próximo al engranaje.
- Mantener información útil sobre errores en el panel; detalles técnicos en consola.
- Conservar los datos del usuario y las claves de almacenamiento al rediseñar la interfaz.

## Integración en userscripts

Cada script incluye su CSS y SVG para instalarse por separado, sin dependencias externas. Aislar estilos con Shadow DOM. Detener la propagación de clics, teclado y rueda dentro del addon para que no activen controles del juego.

Usar IDs únicos por addon y no instalar un segundo panel si ya existe. Limitar el panel al viewport, con scroll interno y espacio para el chat. Mantener el botón principal visible al contraerlo.

## Aplicación al radar

Barra: mostrar/ocultar mapa, historial y engranaje. El minimapa y las coordenadas siguen a mano. Todos los dorados recibidos se muestran sin filtro por tipo. En configuración: puntos históricos y exportación. El historial conserva el mapa, fecha y posición de los encuentros. Contraer no detiene la captura.

## Comprobación antes de entregar

Verificar apertura/cierre, cambio de icono y estado, foco con teclado, configuración inicial cerrada y persistencia de datos. Probar los controles en la demo local sin activar automatizaciones en la cuenta real. Guardar una captura del panel abierto.

## HUB · contrato de integración v1

En modo extensión, `src/extension/page-bridge.js` consume este registro sin cambiar los motores: oculta las ventanas del documento y proyecta Config/Radar/Analytics al panel externo mediante IDs de controles y eventos acotados. No clona hosts dentro del juego ni registra motores nuevos. El contrato local v1 y las transacciones de proveedores se conservan; el protocolo de transporte externo v1 se documenta en [panel externo](extension-panel.md). Tampermonkey no carga este adaptador y conserva la presentación standalone.

`src/hub/hub.user.js` es una capa de presentación, sin motor ni intervalo. Radar y helper conservan sus instancias, temporizadores, almacenamiento y acciones. No importar/copiar `Cycle`, `AutoParty`, `Tracker` ni `Archive` al HUB.

API en el contexto de página (`@grant none`):

- `mu-hub:register`: `CustomEvent.detail = {id, host, getState, actions}`. El registro admite identificadores nuevos; `radar` y `helper` conservan adaptación legacy. `host` mantiene su Shadow DOM y sus listeners. `actions.attach()` adapta su posición/controles para montarlo en HUB; `actions.settings(boolean)` abre/cierra su panel.
- `mu-hub:discover`: HUB pide registro a módulos ya cargados. Los módulos también se registran al iniciar; funciona con cualquier orden de carga. Un ID registrado se acepta una sola vez.
- `mu-hub:state`: helper publica `{id:'helper', state}` desde su refresh existente. HUB vuelve a leer `getState()` y refleja disponibilidad, ciclo, mensaje e integrantes. No realiza polling.
- Helper: `actions.toggle()` pasa por el mismo botón standalone; nunca implementa otra ruta de comandos. Estado: `running`, `ready`, `message`, `partyCount`.
- Radar: `actions.history()` reutiliza el historial. Estado consultable: `map`, `status`, `stopped`. El mapa se actualiza en su propio DOM y scheduler.

Al recibir el registro, HUB mueve el host original, no lo clona. Sin consumidor del registro, los eventos no alteran la vista independiente. Party conserva su motor en Helper; envío y Auto party son preferencias independientes. Helper sincroniza `/autoparty on|off` y conserva `acceptParty` en preferencias v1; no responde solicitudes directamente. Priorizar comandos oficiales del juego para automatizaciones cuando estén disponibles. Con Config instalado, el contador queda junto al estado y el botón informativo desaparece. Ningún ajuste de HUB inicia el ciclo. Para retirar HUB, desactivarlo y recargar.

Verificación local: `tests/hub-ui.cjs` comprueba carga temprana y tardía, configuración cerrada, play/pause, party, historial, independencia sin HUB, registro único y errores de navegador. La captura abierta queda en `docs/screenshots/hub-preview.png`. No se usa la cuenta real. Las demos siguen usando la clave de historial separada.

## Golden hunt · ampliación compatible del contrato v1

- Radar añade `actions.huntingData()`: `{ready, records, types, event}`. Devuelve copias de avistamientos/tipos; `event` es null o `{id, phase, at, startedAt}`. `phase` admite `soon`, `active`, `ended`. Los anuncios globales se reconocen solo en ServerMessage tipo 0; MapEventState evento 3 confirma inicio local. El apagado de un evento por mapa no demuestra un fin global. La identidad se conserva entre warps y vence a los 35 minutos; un aviso global de fin cierra la sesión.
- Helper añade `actions.gold()` y `getState().gold = {enabled, active, message, ready}`. `ready` representa disponibilidad del control, incluida la capacidad de apagarlo durante una cacería. Golden hunt usa el refresh existente, la cola y la sincronización de Home; no ejecuta el paso de Cycle mientras caza.
- Helper descubre Radar mediante los eventos existentes, en cualquier orden de carga y también sin HUB. HUB habilita G solo si la capacidad existe; módulos anteriores conservan sus acciones y no simulan disponibilidad de la cacería.
- El botón Helper representa la intención actual de levelear durante la cacería. Al devolver el control se limpia stage/progreso para recalcular la ruta desde el mapa y nivel actuales. G vuelve a esperar un evento nuevo tras completar el recorrido; se apaga ante errores críticos.
- Clave nueva `mu.gold-hunter.move-levels.v1`, formato `{version:1, entries:{...}}`; los índices contienen servidor (host/puerto sin nonce), personaje, clase y destino. La demo usa `mu.gold-hunter.demo-move-levels.v1`. No se migran ni modifican las claves del Radar o HUB. Datos malformados se conservan sin sobrescribirlos.
- La letra G solicitada se presenta como texto con `aria-hidden`, mientras el botón ofrece nombre accesible, tooltip y `aria-pressed`. HUB pasa a 304 px para alojar sus controles; conserva el límite del viewport.

Prueba integrada: `tests/golden-hunt-ui.cjs`; captura `docs/screenshots/golden-hunt-preview.png`. Las interfaces upstream verificadas y límites están en [evidencia del cliente](golden-hunt-client.md).


## Config independiente · capacidades opcionales v1

El registro sigue usando `mu-hub:register` y descubrimiento `mu-hub:discover`. Mantener `id` único y opcionalmente `name`, `version`, `host`, `getState`, `actions`. Un módulo con vista/acciones propias declara `capabilities.view = {host, order}` y/o `capabilities.actions = {host, order}`. HUB monta esos hosts sin clonarlos y los ordena por `order` (por defecto 100). No llama comandos ni crea controles del motor. Radar/Helper anteriores conservan la adaptación conocida y no requieren estas capacidades.

Config publica `capabilities.configurationWindow = true` y `actions.settings(boolean)`, `actions.open()`, `actions.attach()`. HUB identifica la ventana por capacidad, sin lista de identificadores. Config no se monta dentro del panel: conserva posición fija propia, y attach oculta su engranaje standalone. `mu-config:open` solicita apertura y `mu-config:state` publica `{opened}` para sincronizar el engranaje de HUB. Sin Config, HUB conserva el comportamiento anterior.

Los módulos que ofrecen ajustes declaran:

```js
capabilities: {
  settings: {
    host, order: 10, title: 'Nombre accesible',
    begin(),       // captura estado anterior y rellena el borrador
    validate(),    // null o mensaje; marca errores junto a controles
    apply(),       // persiste/aplica; desde Config 1.3.0 puede devolver Promise
    rollback(),    // restaura begin; desde Config 1.3.0 puede devolver Promise
    discard()      // finaliza edición y rellena controles del estado vigente
  }
}
```

El proveedor entrega un host con estilos propios aislados. Config mueve el host original y ordena por order e id. No conoce campos ni claves. Primero valida todos; después aplica. Si falla un apply, llama rollback en orden inverso (incluido el proveedor que falló), mantiene la ventana y el borrador y muestra el error; distingue restauración fallida. Los proveedores no deben emitir comandos del juego durante apply/rollback: los motores reaccionan desde sus schedulers existentes después de la transacción. Guardar termina con discard; Cancelar no aplica. Un módulo tardío inicia su borrador si la ventana ya está abierta; registros duplicados se ignoran. Desde Config 1.3.0, apply y rollback admiten promesas y se esperan secuencialmente. begin, validate y discard siguen siendo síncronos. Esta ampliación se publica coordinada con Helper 1.18.0; Config anterior no admite ese Helper, por lo que deben actualizarse juntos. El registro de capacidades y eventos conserva v1.

Hasta Helper 1.17.2 se usa `mu.level-helper.settings.v1` (`{version:1, spots:{lorencia:{x,y},arena:{x,y},icarus:{x,y}}, arena, icarus, sendParty, acceptParty}`). La demo usa clave distinta. Valores inválidos existentes se preservan y bloquean guardado para evitar sobrescritura silenciosa. Las preferencias de casco y puntos históricos no se persisten; no se migra ningún almacenamiento existente. Golden hunt conserva sus spots propios.

Config admite proveedores futuros con el mismo contrato sin modificación. Una capacidad nueva requiere coordinar una ampliación compatible o una migración explícita. La suite `tests/config-ui.cjs` registra un módulo ficticio con vista, acciones y ajustes y verifica carga temprana/tardía, registro único, transacciones, viewport y ciclo/cacería. Capturas: `docs/screenshots/config-preview.png` y `config-compact-preview.png`.

Las preferencias arena/icarus son booleanos opcionales v1; al leer registros anteriores sin estos campos se usan ambos activos. No se requiere migración ni cambios en HUB/Config. Lorencia es el destino base cuando no hay un mapa habilitado y accesible por nivel. Desde Helper 1.16.0, Home conserva la búsqueda nativa alrededor del spot también en niveles altos: el addon ya no emite sondeos de movimiento que apagaban y reiniciaban Home.

Helper 1.12.0 añade `excellentLoot` (booleano opcional, false por defecto) y `excellentNames` (array opcional, vacío por defecto) a las mismas preferencias v1. No requiere cambios de HUB/Config/Radar. Coincidencia parcial normalizada en el nombre visible, pero Excellent/Luck se verifican en `droppedItem.item.isExcellent` y `.luck`, nunca por texto. Una única recogida pendiente en el scheduler existente; prioridad a Golden hunt y acciones del ciclo. Home permanece dueño de combate, Zen y jewels; sus filtros amplios provocan pausa accionable cuando la función está configurada. Datos inválidos conservan el bloqueo de guardado existente. Suite adicional `tests/excellent-loot-ui.cjs` y captura `docs/screenshots/loot-config-preview.png`.

## Mapa flotante · capacidad opcional v1

Radar 1.6.0 ofrece capabilities.floatingMap=true, actions.map(visible:boolean) y getState().mapVisible. attach mantiene el host original fijo en body; HUB 1.4.0 ofrece Mapa y conserva adaptación legacy para módulos anteriores. Radar publica mu-hub:state al cambiar visibilidad; no se agregan motores ni intervalos. Minimizar HUB no oculta Radar. Historial lo muestra antes de abrirse. La clave de posición v1 conserva x/y y admite locked opcional (true para registros previos).

## Analytics · capacidades v1

### Slots opcionales de ajustes (Config 1.2.0)

Un proveedor puede ofrecer `slots: {nombre: HTMLElement}` dentro de su host y otro declarar `slot: nombre`. Config mueve el host original del segundo al destino y oculta únicamente su wrapper exterior; conserva el registro, orden y métodos transaccionales de ambos. Resuelve el montaje al registrar módulos en cualquier orden. Sin destino disponible, usa la sección habitual. No clona controles ni cambia motores, almacenamiento o transacciones. Helper ofrece `visualization-tracking` dentro de Visualización; Radar declara ese slot y conserva su proveedor completo, incluido Exportar historial.

Visualización agrupa Trackeo y Estilos. Helper 1.17.0 adapta `setWingsAsync` solamente en el modelo del héroe propio y pasa una copia del item con group/num del catálogo verificado, sin tocar inventario ni charAppearance.wings. Conserva Originales y Blade Knight y ofrece 16 estilos del cliente auditado. Guardar persiste `wingStyle` opcional en preferencias v1 existentes; registros previos usan Originales y Cancelar/rollback restauran el estado previo. Casco continúa por sesión. Restauración y cambios directos marcan charAppearance.changed y cancelan cargas pendientes vía Wings.Unload. Cargas, transformaciones y Chaos Castle suspenden el adaptador. No requiere Play ni emite comandos. Catálogo y límites en wings-client.md.

Analytics registra id analytics y capabilities.actions con su host original y order 50. HUB monta el acceso; la ventana conserva posición propia, Shadow DOM, motor y listeners. Cerrar/minimizar es solo presentación. El motor escucha experienceGained y tiene un refresh independiente de 500 ms para tiempos y condiciones, sin enviar comandos. Detalles y límites en [Analytics](analytics-client.md).


HUB 1.4.3 conserva el botón minimizar al final de header después de montar y ordenar cualquier capability.actions. Analytics 1.1.0 no interrumpe por party y guarda desglose opcional por mob/tamaño/nivel, compatible con historial v1 previo.

Config 1.1.1 no enfoca Cerrar al abrir desde pointer. Cabecera previene foco pointer y libera foco residual; minimizar/restaurar mantiene foco únicamente para activación de teclado (click detail 0). No altera campos, borradores, claves ni motores.

La modalidad de Config se determina por pointerdown/keydown en captura: abrir con mouse no enfoca X incluso sin HUB, y cerrar con mouse no restaura foco a un botón lanzador. Escape cierra la ventana abierta aunque el foco haya quedado en el juego. Los demás eventos de teclado del juego no se interceptan.

## Estadísticas detalladas · Helper 1.19.0 / HUB 1.4.5

Helper añade detailedStats booleano opcional a preferencias v1 por mundo/cuenta (false por defecto) y getState().detailedStats. Panel y capturas A/B en host original con refresh existente; HUB solo ajusta la capa de presentación sobre Radar mientras está habilitado. Sin nuevos motores, comandos ni almacenamiento de capturas. Guardar/Cancelar y rollback existentes. [Fuentes y límites](character-stats-client.md).

## Estadísticas flotantes · Helper 1.19.1 / HUB 1.4.6

El panel se mantiene fuera del HUB en su host independiente; Helper ofrece el host del botón mediante capabilities.actions order 40. HUB monta capacidades adicionales también en radar/helper legacy, conserva hosts originales y minimizar al final. La capa especial de detailedStats en HUB 1.4.5 se retira. Preferencias/cálculo/refresh sin cambios; posición y candado en clave propia. Ocultar no desactiva ni borra A/B.


## Character Info integrado · Helper 1.20.1

Sustituye la ventana flotante: activar en Config → Estadísticas, Guardar, usar el gráfico como toggle y abrir C manualmente. C e inventario pueden coexistir en el build auditado. Detalle/A-B y lectura del tooltip del staff con Play pausado; conserva rango nativo y advierte omisión de slot 0. Preferencias/contrato v1 conservados. Actualizar Helper desde dist o recargar la extensión conjunta; HUB 1.4.6 no cambia. [Fuentes, validación y límites](character-stats-client.md). Demo aislada /demos/helper/character-panels.html. Partida real pendiente.


## Rutas de leveleo · Helper 1.22.0

Preferencias v1 admiten routes, selectedRoute y varySpots; path conserva la ruta seleccionada. Alternativas por nivel de etapa y captura pasiva en scheduler existente; HUB/Config sin cambios de contrato ni motores. Archivo de observaciones separado por mundo/cuenta/servidor, con Web Locks, límites y vencimiento. [Formato y comportamiento](level-routes.md).
