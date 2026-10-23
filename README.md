## Kanturu y Fenrir · Compatibilidad del cliente

Helper 1.31.4 actualiza el puente de conexión y las estadísticas para `index-C5JIMxmo.js` / `layout-A1P3A0u1.js`. Conserva los builds anteriores y C/V con Play pausado. El nombre de ítem usa ahora el export auditado `fg`. Usá el paquete generado en `dist` y recargá extensión y juego. Validación local sin cuenta real; partida real pendiente. [Evidencia](docs/client-kanturu.md).

## Aida y Dark Lord · Extensión 1.0.45

Actualiza la conexión al cliente del 22/10 (index-D-gOSya0 / layout-DCITLqBq), estadísticas y C/V. Radar muestra Aida para el mapa 33. Helper reconoce los mínimos reducidos de traslado de Dark Lord y Lord Emperor. Usá el ZIP generado en dist, reemplazá los archivos de la carpeta instalada, recargá la extensión y después el juego. Validación local sin cuenta real; partida real pendiente. [Evidencia](docs/client-oct22.md).

## Helper 1.31.2 · Segundo cliente del 21/10

El cliente volvió a cambiar a index-Do3IjarP / layout-CoOAKkh-. Se actualizan juntos el puente de identidad y las estadísticas, conservando el adaptador anterior. Si aparece «Cliente no compatible», reemplazá los archivos de la carpeta instalada por el nuevo paquete de `dist`, recargá la extensión y después el juego. Validación con fixtures aislados; partida real pendiente.

## Helper 1.31.1 · Estadísticas y C/V del 21/10

Estadísticas detalladas y Permitir C e inventario juntos reconocen el cliente index-URnTVW_1 / layout-DQbdTT-G. El cálculo usa el staff principal como Character Info y conserva los porcentajes/opciones separados. Ambos switches funcionan con Play pausado; no abren ventanas. La primera cuenta detectada informa «cuenta conectada; inicio manual», sin confundirla con un cambio de cuenta. El puente de identidad se conserva. Validación local con fórmulas y cierres nativos extraídos; partida real pendiente. [Auditoría y límites](docs/character-stats-client.md).

## Extensión Chrome 1.0.42 · Compatibilidad con el cliente del 21/10

La extensión vuelve a resolver cuenta/personaje con index-URnTVW_1.js / layout-DQbdTT-G.js, que ya no publica los globals anteriores. Reutiliza los singletons exportados por el cliente y conserva motores, ajustes e identidad. Un build desconocido muestra un diagnóstico y mantiene las acciones bloqueadas. Alcance: extensión Chrome; los userscripts independientes no incorporan este adaptador. Validación en fixtures sin cuenta real; usar el paquete generado en `dist` y recargar extensión y juego para actualizar.

## Helper 1.31.0 · Recogida independiente de Kundun

En Obtener, activá **Recoger cajas Kundun (+1 a +5)** y Guardar, junto con Activar loot del addon. Reconoce el tipo real sin escribir nombres ni exigir Excellent/Luck. Usa el rango desde el personaje y puede recoger fuera del spot; durante una recogida pendiente posterga el retorno al spot. Requiere Play y Home activos y todos los filtros de recogida nativos apagados. Cambios de etapa, viajes, reset y clics manuales conservan prioridad. Validado en simulación local; aceptación del servidor en partida pendiente.

## Helper 1.30.1 · Extensión Chrome 1.0.39

Nueva distribución local del Helper con programación horaria. Se incrementa la versión para distinguirla de la extensión 1.0.38 anterior; la lógica del reloj de Helper 1.30.0 se conserva. El release oficial genera la carpeta canónica dist/chrome-extension, el ZIP y sus manifiestos juntos.

## Helper 1.30.0 · Programación diaria en hora de Argentina

Configuración → Leveleo → Programación: elegí inicio y fin y pulsá Guardar programación. Deshabilitada por defecto (02:00–06:00), admite medianoche y conserva pausa manual tras recargar. F10/Play respetan la franja; los fallos no causan reinicios repetidos. Caza conserva su control independiente. [Política, almacenamiento y límites](docs/daily-schedule.md). Validación local sin cuenta real; partida real pendiente.

## Helper 1.29.5 · Configuración visible y casco persistente

Todas las secciones del panel externo mantienen los ajustes visibles al Guardar o Cancelar. Ocultar casco ahora es un switch que se guarda automáticamente por cuenta y se restaura al recargar. Alas sigue requiriendo Guardar.

## Helper 1.29.4 · Inicio sin transporte redundante

F10 inicia o reanuda sin otro transporte si ya estás en el mundo y spot elegido, dentro de dos casillas, aunque existan variantes como Devias 2. Conserva el spot entre pausas. Más lejos y al cambiar de etapa mantiene los viajes y confirmaciones necesarios. [Política de navegación](docs/level-routes.md). Validación local; partida real pendiente.

## Helper 1.29.3 · Posiciones nativas de C/V

C e inventario conservan su arrastre, escala y posiciones guardadas por el juego. El refresh ya no las ancla a las esquinas. Solo el detalle A/B se acomoda alrededor de C para caber en pantalla. Validación local en ambos skins; no se instala ni cambia la partida automáticamente.

## Helper 1.29.2 · Corrección de coexistencia C/V

Corrige el cierre mutuo de C e inventario en el build actual: el switch ON instala el hook acotado y permite abrir ambos manualmente; OFF restaura la exclusividad nativa en próximas aperturas. Se reprodujo el fallo con el registro real del cliente y se validó la corrección en fixtures aislados. Partida real pendiente.

## Helper 1.29.1 · Detalle automático al abrir C

El switch Estadísticas detalladas es el único control: activado, muestra el detalle al abrir C manualmente, incluso tras recargar. Se retiran el botón del gráfico, «Detalle en C» del Centro de control y minimizar el detalle. Apagado lo oculta y limpia A/B. No abre C ni inicia Play. Validación local; partida real pendiente.

## Helper 1.29.0 · Estadísticas y switches inmediatos

El detalle en C muestra métricas y comparación A/B, sin lista de objetos. En Config → Estadísticas, ambos switches se guardan al cambiarlos; la ayuda está en «?» con mouse, teclado o toque. En el Centro de control no requiere Guardar ni Abrir configuración. Adaptador auditado para el build público del 14/10. La conclusión inicial sobre convivencia nativa fue incorrecta y se corrigió en 1.29.2. Validación local; partida real pendiente. [Detalle y límites](docs/character-stats-client.md).

## Helper 1.28.0 · Party con espera de 2 segundos

Config → Party: «Invitar solo al clan» y «Invitar fuera del clan» son independientes. La nueva opción está apagada por defecto y requiere Guardar. Ambas esperan 2 segundos cerca y conservan el límite entre invitaciones. Solo se comparan clanes confirmados; jugadores sin dato de clan no reciben invitaciones. Auto party mantiene su función actual. [Comportamiento y límites](docs/party-guild.md). Validación local; partida real pendiente.

## Helper 1.27.0 · Caza del Balrog

Config → Caza: habilitá el Balrog. Con aviso y destino válido aparece su Play/Pausa en juego. Play pausa leveleo, viaja y enciende Home al llegar. Pausa detiene Home y libera el control para usarlo manualmente con el teclado. También disponible en el panel externo. No se rearma al próximo evento. Golden hunt sigue retirado. Validación local; partida real pendiente. [Uso y evidencia](docs/balrog-client.md).

## Helper 1.26.0 · equipo completo y C/V

Config → Estadísticas: **Permitir C e inventario juntos** se guarda al cambiarlo, incluso con lector y Play apagados. No abre ventanas; apagar restaura exclusividad en próximas aperturas. El lector actualizado muestra cada slot equipado (armadura, anillos, pendant, alas, armas/escudo y mascota), sus propiedades y tooltip del cliente, con comparación A/B por piezas. Adaptador revalidado para el build público actual. Validación local; partida real pendiente. [Detalle](docs/character-stats-client.md).

## Helper 1.25.0 · Play/Pausa en el juego

F10 inicia o pausa el mismo ciclo del panel. Mini control movible por su asa, con estado Activo/Pausado y posición recordada. Sigue visible con panel externo. F10 ignora repeticiones, modificadores y escritura en campos. Validación local; partida real pendiente.

## Helper 1.24.1 · Reingreso después del reset

Tolera demoras de ejecución al dejar el juego en segundo plano: al volver a ejecutar, evalúa la selección del personaje original sin agotar el plazo por el tiempo suspendido. Hasta tres intentos espaciados, sin repetir /reset ni seleccionar otro personaje. Confirma el reset al entrar con nivel menor. Pausa manual, logout o pérdida de identidad autenticada cancelan el reingreso. Chrome puede congelar/descartar una pestaña; el cambio no evita esa suspensión. Validado con fixtures locales, pendiente de partida real. [Detalle](docs/reset-reentry.md).

## Contador de Golden Invasion · Radar 1.9.1

Durante la invasión aparece un contador dentro del juego con el total informado por el cliente. Debajo del total se ve una fila por mapa con la cantidad restante, sin pasar el mouse. Si falta el desglose, indica «Sin datos por mapa». Desbloqueá el candado para moverlo y volvé a fijarlo; conserva posición y bloqueo. Funciona con Play pausado y con el panel externo. Sin datos vigentes muestra «Sin datos»; al finalizar se oculta. Validado en demos, pendiente de partida real.

## Centro de control en otra pestaña

La extensión abre su panel al hacer clic en su icono: elegí la pestaña del juego y pulsá **Conectar**. El botón cambia a **Desconectar**; la flecha ↻ reconecta el panel y descarta cambios sin guardar. Ambas acciones conservan el estado de Play. La lista se actualiza al volver al panel o entrar al selector. Configuración, Radar/historial y EXP por spot quedan en el panel; HUB y ventanas flotantes se ocultan en el juego. **Minimapa en el juego** permite mostrar el Radar como overlay opcional. No requiere localhost, Node ni un servidor.

La barra superior permanece visible al scrollear: partida, vistas, secciones y Play/Pausa. **Actualizar extensión** recarga los archivos de la carpeta instalada; para un ZIP nuevo, reemplazá primero los archivos. Después recargá el juego manualmente.

Guardar/Cancelar conserva las transacciones y perfiles actuales. Play se controla desde la cabecera. Cerrar el panel no pausa los motores; cerrar/recargar el juego interrumpe ese documento. Un cambio de cuenta o personaje invalida la conexión y el borrador: reconectá explícitamente. El navegador puede suspender pestañas ocultas. [Arquitectura y uso](docs/extension-panel.md).

## Helper 1.24.0 · Switches de leveleo

Spots, Usar este mapa, Reset automático al nivel 400 y Mantener Soul Shield usan switches ON/OFF y se guardan al cambiarlos. Cancelar conserva esos switches. Coordenadas, niveles y demás ajustes siguen aplicándose con Guardar. Si un spot tiene coordenadas o estructura pendientes, guardalo primero para poder cambiar su switch por separado. Desde nivel se muestra debajo de Usar este mapa. No inicia Play.

## Helper 1.23.0 · Mapas y spots de leveleo

Elegí entre los 26 destinos y guardá varios spots por mapa con su nivel de entrada. El personaje elige uno y permanece hasta el siguiente mapa o reset; cambia de mapa al alcanzar el nivel configurado, incluso con enemigos presentes. Las rutas anteriores quedan recuperables. Guardar no inicia Play. [Uso y límites](docs/level-routes.md).

## Helper 1.20.2 · Pasos de leveleo opcionales

Cada paso tiene un toggle: apagarlo conserva mapa, nivel, coordenadas y orden, y lo omite del recorrido después de Guardar. Debe quedar al menos un paso activo. Las rutas anteriores sin enabled mantienen todos sus pasos activos.

# MU · Radar, Helper y HUB

Seis userscripts independientes para https://mu.mormon.garden/.

## Extensión local de Chrome

Para compartir el conjunto vigente: `npm run share:extension`. El ZIP `dist/mu-web-chrome-<versión>.zip` incluye la extensión y `INSTALAR.txt`; quien lo recibe debe descomprimirlo y cargar la carpeta `chrome-extension`. Cada release genera el ZIP con su versión correspondiente.

El mismo conjunto también se genera como extensión Manifest V3 con panel en una pestaña propia. Un worker abre/enfoca el panel y comunica las pestañas; los motores permanecen en el juego. Requiere Chrome 120 o posterior y actúa solamente en `https://mu.mormon.garden/*`, dentro del documento principal.

1. Desactivá los seis userscripts de este proyecto en Tampermonkey antes de usar la extensión.
2. Abrí `chrome://extensions`, activá **Modo desarrollador** y elegí **Cargar descomprimida**.
3. Seleccioná `D:\Cosas\Dev\mu-web\dist\chrome-extension` y recargá el juego cuando puedas interrumpir la partida.

Para actualizar, ejecutá el release local, pulsá **Recargar** en la extensión y recargá el juego. Para volver a Tampermonkey, desactivá la extensión, reactivá un userscript vigente por módulo y recargá. No uses ambos formatos a la vez; la protección de instancia de las versiones nuevas es una defensa adicional y no protege todas las versiones antiguas.

La extensión usa exactamente las mismas fuentes y el `localStorage` del juego: conserva ajustes e historiales sin migración. Sus metadatos y hashes están en `dist/manifest.json`, sección `extension`. La validación usa Chromium con un perfil desechable y la URL del juego interceptada con fixtures locales: no usa cuenta ni conexión al servidor. La respuesta pública de la raíz se consultó sin cuenta: no devolvió headers CSP ni meta CSP. La partida real sigue pendiente. Detalles en [extensión y validaciones](docs/chrome-extension.md).

## Instalar y actualizar

**Configuración por cuenta (Helper 1.18.0 + Config 1.3.0):** actualizar ambos módulos juntos (o recargar la extensión generada). Helper muestra la cuenta autenticada en Config y guarda sus ajustes por mundo/cuenta, compartidos entre personajes. Para recuperar tu configuración previa, elegí **Importar configuración anterior** y **Guardar**: la copia anterior permanece intacta. Cambiar de cuenta pausa Play; volver a una cuenta no inicia el bot. La party requiere Play. Posiciones, Radar e historiales siguen siendo generales. Esto no modifica ni garantiza sesiones simultáneas del juego. [Alcance y migración](docs/account-settings.md).

Instalá un script separado en Tampermonkey por cada archivo de `dist`: `golden-radar.user.js`, `level-helper.user.js`, `hub.user.js`, `config.user.js`, `analytics.user.js` e `interface.user.js`. Para actualizar, reemplazá **todo** el contenido del mismo script, guardá y recargá el juego cuando puedas interrumpir la partida. Conservá un solo script activo por módulo. El orden de carga es independiente.

Las versiones y hashes vigentes están en [dist/manifest.json](dist/manifest.json). Los archivos de `dist` están listos para instalar; los de `src` son la fuente de desarrollo. No hay actualización automática por URL.

- **Radar 1.8.3:** todos los dorados recibidos visibles, historial local, movimiento y posición persistente; funciona solo o dentro de HUB. No confirma spawns reales ni detecta fuera del alcance del cliente.
- **Helper 1.20.2:** ruta de 1–26 pasos con mapa, nivel y casilla actuales precargados al agregar, y X/Y editables; reset opcional, reingreso y party automática. Usa el MU Helper nativo; configurá skills y pociones previamente en el juego. Play/pause controla el ciclo y permite reintentar después de una confirmación vencida de Home; informa el bloqueo de inicio en zona segura. Envío de invitaciones y Auto party tienen preferencias independientes. Pestaña Obtener con categorías de loot y nombres con condiciones Excellent/Luck.  Agranda automáticamente los timers nativos a 16 px, independientemente de Interface size, en cada ingreso/recarga.
- **HUB 1.4.6:** presentación integrada, posición bloqueable y registro extensible por capacidades; conserva el mapa al abrir Config.  No duplica motores ni envía comandos por su cuenta.

**Config 1.3.0:** cuarto userscript, ventana flotante arrastrable y minimizable sin perder el borrador, con Guardar/Cancelar. Descubre ajustes de módulos compatibles sin conocer sus identificadores. La primera incorporación requiere actualizar los cuatro scripts; futuras releases compatibles pueden actualizar un solo módulo.

El historial permanece en `localStorage` del origen del juego, clave `mu.golden-radar.sightings.v1`; exportalo desde Radar antes de migraciones de datos. Las posiciones usan `mu.golden-radar.position.v1` y `mu.hub.position.v1`. Las demos usan claves aparte. Los respaldos de código no incluyen datos del navegador.

## Golden Invasion informativa

La cacería automática está retirada desde Helper 1.24.2 y HUB 1.4.7: no hay botón G ni sección Goldens. Las acciones antiguas no pueden iniciarla; las preferencias históricas se conservan. El contador de Radar mantiene total y cantidades por mapa durante la invasión, incluso con Play pausado y panel externo. Minimapa, historial y tracking siguen disponibles.

## Desarrollo

### Usar el proyecto en otra computadora

Con acceso al repositorio privado `nachthelad/mu-web`, instalá Git y Node.js y ejecutá:

```powershell
git clone https://github.com/nachthelad/mu-web.git
cd mu-web
npm install
npx playwright install chromium
npm run dev
```

Abrí `http://127.0.0.1:4173/` para las demos locales, o agregá la carpeta clonada como proyecto en Codex. Los instalables vigentes están en `dist`. Las preferencias y sesiones del navegador no se transfieren con el repo.

Para sincronizar, subí tus commits con `git push` y, antes de trabajar en la otra computadora, ejecutá `git pull --ff-only` con el árbol de trabajo limpio. GitHub recibe los cambios subidos; no sincroniza automáticamente archivos ni el historial de este chat.

```text
npm run dev
npm run check
npm test
npm run test:ui
npm run release
npm run release -- --module helper
npm run release -- --module config
npm run rollback -- --set <id>
```

`dev` sirve solo en http://127.0.0.1:4173/. La portada es la demo integrada; `/preview.html`, `/helper-preview.html` y `/hub-preview.html` conservan acceso a las demos. Ctrl+C detiene el servidor. No usa cuenta ni servidor del juego.

Las pruebas de interfaz requieren Playwright y Chromium. En Codex se usa el runtime local disponible; fuera de Codex, ejecutá `npm install` y `npx playwright install chromium`. No hace falta instalar dependencias para usar los userscripts en el navegador.

`release` ejecuta sintaxis, pruebas de lógica y quince suites de interfaz antes de preparar `dist`. Conserva la vigente más tres anteriores por módulo y los últimos conjuntos compatibles. `rollback` restaura solamente los instalables de `dist`; no modifica `src` ni Tampermonkey. Más detalles en [organización y updates](docs/organization-and-updates.md).

## Archivos de referencia

- **Interfaz 1.1.2:** script independiente para la barra clásica sin dragones, fondo de borde a borde y orbes/controles nativos conservados. Se adapta sin deformar sprites. Desactivar y recargar restaura el original. Demo `/demos/interface/preview.html`; [evidencia y límites](docs/interface-client.md). Partida real pendiente.

- [Contrato HUB y diseño compartido](docs/addon-design.md).
- [Catálogo auditado](docs/golden-catalog-audit.md).
- [Changelog](docs/changelog.md).
- [Notas anteriores a la reorganización](docs/history-before-organization.md): archivo histórico, no instrucciones actuales.
- [Capturas actuales](docs/screenshots/).

La integración depende de interfaces internas del cliente. Las pruebas locales verifican lógica e interfaz; falta confirmar detección durante una invasión real y movimiento/combate/reset en una partida real. No se publicaron archivos en Internet ni se modificó la instalación del navegador.

## Ajustes

Leveleo ofrece una ruta de 1 a 26 pasos. Cada fila permite elegir uno de los 26 destinos de la captura de M, escribir X/Y (enteros 0–255) y fijar desde qué nivel usarlo. Elegir destino precarga su mínimo; podés aumentarlo hasta 399. Los niveles deben crecer en el orden de la ruta. + agrega otro paso con el mapa base reconocido, nivel y casilla actuales; sin datos disponibles conserva entrada manual. Arena 2/3/4 se reconocen por sus IDs 83/84/85; las otras variantes compartidas se eligen manualmente y los niveles fuera de orden requieren corrección. ↑/↓ lo reordenan y × lo quita. Las filas determinan cuántos destinos recorrer. Por debajo del primer mínimo, el personaje continúa en el mapa inicial sin intentar un warp inaccesible. Tras reset vuelve a evaluar desde el inicio.

Leveleo tiene el switch «Reset automático al nivel 400», activado por defecto y guardado junto a la ruta. Apagado continúa leveleando en el último spot sin enviar /reset. Activarlo durante un ciclo permite resetear al llegar a 400; Guardar no inicia un ciclo detenido. Desactivarlo cancela un reset en cola aún no enviado, pero una solicitud ya enviada debe esperar la respuesta del servidor.

Los spots guardados antes de esta versión se conservan. Sin ruta previa, se muestran Lorencia 47/59 desde 10, Arena 12/39 desde 50 e Icarus 43/155 desde 170, respetando los antiguos interruptores de mapas. Guardar conserva la ruta, loot y party en la misma clave mu.level-helper.settings.v1; la demo usa mu.level-helper.demo-settings.v1. Cancelar, X o Escape descartan la edición. Minimizar con − conserva el borrador y deja una barra chica; ＋ lo restaura. Guardar no inicia el ciclo; al guardar una nueva ruta activa recalcula el destino, la aplica al leveleo.

Los destinos/minimos y costos visibles son una referencia de la captura provista: no garantizan los requisitos futuros del servidor. Las rutas nuevas usan el mismo pedido de warp de M cuando el cliente lo expone y comandos como alternativa. Un rechazo/timeout pausa; no se inventa una llegada. Devias, Dungeon, Lost Tower, Atlans, Tarkan y Arena conservan sus variantes separadas.

Obtener permite activar el loot del addon, ajustar rango 1–8 y elegir Todo, Jewels/Gems, Zen sin moverse, Ancient o Excellent. Las categorías se suman: Excellent recoge cualquier Excellent, aunque no coincida con los nombres. Todo recoge cualquier tipo de drop; el Zen siempre se limita a tu casilla o una adyacente, sin iniciar movimiento. El rango configurable se aplica a los demás items. La lista de nombres tiene Agregar y Quitar línea seleccionada (la línea donde dejaste el cursor); también se puede editar directamente. Exigir Excellent y Exigir Luck se aplican juntos solo a esa lista. No distingue mayúsculas y usa coincidencia parcial. Hasta 50 nombres de 80 caracteres. La lista antigua migra con ambas condiciones y conserva su estado de activación.

Para usar el nuevo loot, apagá todos los filtros de recogida en Home, incluidos Zen y jewels, y elegilos en Obtener. Si compiten, el ciclo pausa y muestra el aviso. El addon no modifica Home: skills, buffs, reparación y pociones siguen configurándose allí. El modo antiguo, hasta guardar con la nueva interfaz, mantiene su compatibilidad previa con Zen/jewels nativos. Con el loot del addon apagado, Home conserva sus filtros independientes.

El picker solo actúa con el ciclo activo y asentado en el spot, dentro del rango y radio de la ruta; se suspende durante traslados, muerte y pausa. Equipo requiere confirmación de inventario y Zen la respuesta de actualización de dinero. Rechazo o 15 segundos sin confirmación omiten ese drop por un minuto. Desaparición no es éxito. La respuesta no incluye ID del drop: una recogida manual simultánea del mismo tipo puede afectar la asociación.

Enviar invitaciones y Auto party empiezan activados. Auto party usa /autoparty on|off incluso con el ciclo pausado. Apagar envío suspende expulsiones; el alcance de party automático sigue en Arena e Icarus. Ocultar casco es por sesión: marcado oculta, desmarcado muestra. Trackear dorados solo oculta/muestra puntos históricos; la captura continúa. Party y Visualización son pestañas, junto a Leveleo y Obtener.

Actualizar los dos scripts Helper y Config desde dist, reemplazando el contenido del mismo script de Tampermonkey y manteniendo uno activo por módulo. Las fuentes y pruebas locales no confirman funcionamiento en partida real.

Capturas: [Ruta](docs/screenshots/level-route-preview.png), [Obtener](docs/screenshots/obtain-preview.png), [ventana minimizada](docs/screenshots/config-minimized-preview.png) y [viewport compacto](docs/screenshots/obtain-compact-preview.png).

Mapa flotante: HUB agrega el botón Mapa para mostrar/ocultar el Radar separado. Su candado permite arrastrar la cabecera y fijarlo; posición y bloqueo se recuerdan al recargar. Minimizar HUB no oculta el mapa. Actualizar Radar y HUB juntos desde dist.


Leveleo agrega Mantener Soul Shield, activado por defecto: se aplica durante el leveleo. Confirma el efecto, evita duplicar el buff configurado en Home y recupera la skill anterior. Si falta la skill, recursos o confirmación, muestra el aviso y continúa. Play apagado detiene los casts propios. Actualizar Helper y Radar juntos desde dist; HUB y Config mantienen compatibilidad.

HUB 1.4.2 libera el foco de sus botones después de un clic: Enter vuelve al juego en vez de repetir la última acción. Abrir/cerrar Config con mouse no deja el engranaje seleccionado. Tab y Enter mantienen la navegación por teclado. Para este ajuste alcanza con actualizar HUB desde dist.
Radar 1.8.1 agrega Trackear White Wizard Corps (blanco, incluye soldados/arqueros) y Trackear Red Dragon (rojo) en Config → Radar. Empiezan apagados; Guardar persiste ambas preferencias para próximas recargas y Cancelar descarta. No son objetivos de Golden hunt ni se agregan al historial dorado. Actualizar solo Radar desde dist. Detección limitada a entidades recibidas por el cliente; partida real pendiente.

Analytics 1.1.2: ventana flotante EXP por spot, mediciones manuales de 5 minutos y ranking por EXP/min. Instalá el nuevo dist/analytics.user.js como script independiente. HUB 1.4.3 deja minimizar al extremo derecho. Analytics continúa ante cambios de party y muestra EXP recibida por mob, separada por cantidad de integrantes. Historial, radio, interrupciones y fuente de EXP: [Analytics](docs/analytics-client.md). Demo: /demos/analytics/preview.html. Partida real pendiente.


Config 1.1.1 evita que los botones −/＋ y Cerrar capturen foco al usarlos con mouse. Actualizar solo dist/config.user.js. Tab y Enter conservan navegación deliberada.

Analytics 1.1.1 evita foco de mouse en −/＋ y X de la ventana EXP por spot. Actualizar solo dist/analytics.user.js; Tab y Enter conservan su uso deliberado.

Analytics 1.1.2 continúa con Alt+Tab/pestaña oculta y tolera intervalos retrasados en segundo plano. Mantiene el plazo de cinco minutos y cuenta solo EXP recibida dentro de él. Actualizar solo dist/analytics.user.js.

White Wizard y Red Dragon se conservan al recargar después de Guardar en Config; sin Config, al cambiar sus switches. Usan mu.golden-radar.settings.v1 (clave separada en demo).

Visualización (Helper 1.16.0, Radar 1.8.2, Config 1.2.0) reúne Trackeo de dorados/White Wizard Corps/Red Dragon y Estilos: casco y alas. Helper 1.17.0 conserva Originales/Blade Knight y agrega otros 15 estilos verificados del cliente, incluidas capas. Guardar recuerda las alas al recargar; Cancelar descarta. Las alas cambian solo el modelo propio si hay alas equipadas y conservan equipo/stats. El casco dura la sesión. Instalar los tres módulos desde dist; HUB no requiere actualización. Pruebas en demo, apariencia real pendiente. [Evidencia](docs/wings-client.md) y [captura](docs/screenshots/visualization-wings-preview.png).

## Estadísticas detalladas

Helper 1.19.0 y HUB 1.4.5: Config → Estadísticas → Estadísticas detalladas → Guardar. Capturá A, cambiá el staff manualmente y capturá B. Rangos calculados del panel nativo y bonus del staff separados; daño efectivo no disponible. Funciona con Play pausado. [Fuentes, comparación y límites](docs/character-stats-client.md).

Historial Helper 1.19.1 / HUB 1.4.6: la presentación flotante fue sustituida por el detalle integrado en C en la entrega actual.


## Character Info integrado · Helper 1.20.1

Sustituye la ventana flotante: activar en Config → Estadísticas, Guardar, usar el gráfico como toggle y abrir C manualmente. C e inventario pueden coexistir en el build auditado. Detalle/A-B y lectura del tooltip del staff con Play pausado; conserva rango nativo y advierte omisión de slot 0. Preferencias/contrato v1 conservados. Actualizar Helper desde dist o recargar la extensión conjunta; HUB 1.4.6 no cambia. [Fuentes, validación y límites](docs/character-stats-client.md). Demo aislada /demos/helper/character-panels.html. Partida real pendiente.

Helper 1.21.0: «Usar ubicación actual» en cada fila actualiza solo mapa y X/Y del borrador. Requiere ubicación válida y destino inequívoco; las variantes con ID compartido se conservan sin cambios y muestran un aviso. El nivel no se corrige automáticamente. Guardar aplica y Cancelar/cierre/Escape descartan. Captura: [editor](docs/screenshots/route-current-location-preview.png).
