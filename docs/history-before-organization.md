# MU · Golden Radar

Overlay local para https://mu.mormon.garden/. Detecta los 20 tipos de dorados del catálogo del cliente, utilizando el mundo que el cliente ya recibió. No necesita tu contraseña y no envía datos a otro servicio.

## Instalar en tu navegador

1. Usá un gestor de userscripts como Tampermonkey, obtenido desde la tienda oficial de extensiones de tu navegador.
2. Creá un script nuevo, reemplazá su contenido por `golden-radar.user.js` y guardalo. Si el gestor indica que necesita habilitar la ejecución de userscripts, seguí sus instrucciones.
3. Recargá https://mu.mormon.garden/ y entrá con tu personaje. El panel aparece a la izquierda. Minimizar conserva el monitoreo; × lo desactiva hasta la próxima recarga.

El script usa `@grant none`, necesita ejecutarse en el contexto de la página para leer `window.__world` y `window.__eventBus`. Si aparece “Esperando personaje” estando conectado, comprobá la ejecución del script en el contexto de página de tu gestor. No ejecutar dentro de un iframe externo: el origen impediría leer el mundo del juego.

### Ajustar altura (v1.1.0)

Arrastrá la esquina inferior derecha hacia arriba/abajo. El contenido tiene scroll y la cabecera permanece visible. La altura inicial es 380 px para dejar espacio al chat; el tamaño elegido dura hasta la recarga.

Para actualizar una instalación existente, reemplazá el contenido del script en Tampermonkey por la nueva versión, guardá y recargá el juego cuando puedas interrumpir la partida.

## Qué muestra

### Historial entre sesiones (v1.2.0)

Guarda automáticamente la primera posición observada de cada dorado recibido, con mapa, tipo, fecha/hora y si el radar había recibido el anuncio de invasión. No guarda cada movimiento como un nuevo spot. Volver a encontrar una entidad nueva o reencontrarla en otra sesión/visita puede agregar otro registro: el número de registros no equivale al número de spawns reales.

Los datos quedan en `localStorage` de `https://mu.mormon.garden/`, bajo la clave `mu.golden-radar.sightings.v1`, en tu perfil de Chrome. La PWA y la pestaña comparten los datos si usan ese mismo perfil y origen. Persisten al recargar y cambiar de mapa; borrar los datos del sitio o usar otro perfil no conserva ese historial. No se sincronizan ni se envían a un servidor.

Las cruces azules muestran registros históricos del mapa actual, separados de las detecciones actuales. Abrí «Historial» para ver los últimos diez y exportar todos en JSON como respaldo. Conserva hasta 5.000 registros, reemplazando los más antiguos. Captura todos los tipos de dorados aunque ocultes Budge en la vista. Sólo captura mientras el script está ejecutándose; los encuentros anteriores a instalar esta versión no se recuperan.

Si el navegador impide leer o guardar, el panel advierte que los datos de la sesión deben exportarse. La demo usa una clave aparte para evitar contaminar los registros reales. Un avistamiento no confirma dónde spawneó el dorado: puede haber caminado antes de que lo vieras.

- Invasión confirmada: recibió MapEventState dorado para el mapa actual después de instalarse.
- Dorados detectados sin anuncio: hay un dragón recibido pero el radar no vio el anuncio (por ejemplo, se inició con la invasión en curso).
- Punto lleno: monstruo presente en el estado del cliente; su posición se actualiza cuatro veces por segundo.
- Círculo vacío: última posición observada, caduca después de 90 segundos. No significa que siga allí ni que haya aparecido allí.
- El mapa es una vista de coordenadas con transitabilidad muestreada, no el minimapa artístico original. Distancia en línea recta, en tiles.

El cliente recibe objetos dentro de su alcance. Este radar no puede ubicar dragones que todavía no recibió, ni determinar spawns reales del servidor. Tampoco interpreta los dragones decorativos del cielo como enemigos. Muertos recibidos se eliminan; una muerte fuera de alcance sólo se descubre al volver o al caducar el avistamiento.

## Prueba local

`npm test` y `npm run check`. Abrir `preview.html` prueba estados con datos simulados; no se conecta al juego. Puede servirse con `node server.cjs` y abrir http://127.0.0.1:4173/preview.html.

No se verificó todavía una detección durante una invasión real con una cuenta conectada. Se verifican el formato del evento, los filtros y la interfaz mediante simulación; la integración usa globals y paquetes comprobados en el bundle público servido el 2026-10-04. Si el cliente cambia esas interfaces puede requerir una actualización.

## Level Helper (script separado)

Creá un segundo userscript con todo el contenido de `level-helper.user.js`. No reemplaces el radar por el helper. Guardá, recargá el juego y pulsá ▶ en el botón derecho. Configurá previamente las skills, pociones y radio en el MU Helper del juego. Al llegar al spot, el script activa ese helper usando la misma función que Home; lo detiene antes de viajar o resetear y vuelve a activarlo tras regresar. Espera la confirmación del servidor para no pulsar Home dos veces.

La ruta es Lorencia 47,59 hasta nivel 50; `/move arena` y Arena 12,39 (alternativa 31,74); opcionalmente `/move icarus` a nivel 170 y 43,155. Envía `/reset` a nivel 400 y espera que baje el nivel para volver a Lorencia. Tras morir vuelve al spot de la etapa actual. Durante el reset espera hasta 90 segundos el reingreso: en la selección elige exactamente el personaje con el que iniciaste, una sola vez, y espera entrar al mundo y confirmar el descenso de nivel. No reenvía /reset. Otras desconexiones, cambio de personaje, comando sin respuesta o falta de progreso detienen el ciclo; reiniciar es manual. Si vuelve al login y el cliente no reconecta por sí mismo, pausa al agotarse la espera.

No asigna stats; las skills y pociones las maneja el helper nativo según su configuración. El personaje debe estar equipado y cumplir los requisitos de acceso. La configuración y el estado del ciclo duran hasta recargar. La UI del helper tiene solamente un botón ▶/⏸. Usa la ruta predeterminada por Icarus y Arena 12,39.

Se verificaron las transiciones y la interfaz en `helper-preview.html` con un servidor simulado. Falta verificar movimiento, combate y reset en una partida real. La integración depende de las funciones internas del cliente y puede requerir cambios tras una actualización.

### Radar que no aparece

La captura de Tampermonkey muestra versión 1.0.0; el archivo actual es 1.2.3. Para actualizar, abrí el editor, seleccioná **todo** (Ctrl+A), pegá el archivo completo, incluido el encabezado `==UserScript==`, y guardá (Ctrl+S). El dashboard debe indicar 1.2.3. Recargá la PWA cuando puedas. Esta versión añade diagnóstico de inicio y una corrección de compatibilidad; la causa exacta en la instalación existente todavía no está confirmada. El panel debe aparecer aun sin invasión.

## Referencias

- [Repositorio enlazado por el propio juego](https://github.com/Ignies/OpenMu-Client-Babylon).
- [Estado de invasión por mapa](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/events/invasion.ts).
- [Mundo y entidades del cliente](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/ecs/world.ts).

El upstream consultado difiere del bundle desplegado en el temporizador horario; el radar usa el evento del servidor y no ese horario.

Version 1.4.0: boton de grupo para activar/desactivar invitaciones automaticas de party, independiente del ciclo de leveleo. Apagado inicialmente; jugadores recibidos dentro de 2 tiles por eje, un envio cada 10 segundos, una invitacion por nombre por personaje/sesion. Excluye miembros actuales y no envia sin liderazgo o con party llena. Enter sigue aceptando invitaciones mediante el juego.

Version 1.4.1: invitaciones automaticas exclusivamente en Arena (6) o Icarus (10). En otros mapas el boton puede quedar activado, pero no envia.

Version 1.5.0: tercer boton de engranaje abre/cierra un panel informativo con ruta, estado, personaje, resets y configuracion de party. Cerrado al iniciar.

## Convencion de interfaz

Ver [docs/addon-design.md](docs/addon-design.md) para los patrones reutilizables de controles compactos y configuracion desplegable. Radar 1.3.1 aplica la barra de iconos, historial y engranaje; ajustes cerrados inicialmente.

MU Helper 1.6.0: party siempre activa, independiente de play/pause. Acepta invitaciones automaticamente mientras no tenga cinco miembros. En Arena/Icarus invita hasta cinco, contando al personaje; busca al menos un compañero, segun jugadores cercanos y aceptaciones. Reintenta cada minuto por nombre, con un envio cada diez segundos. Al irse un miembro permite invitarlo nuevamente y rellena la vacante. Sin liderazgo no puede enviar invitaciones.

## HUB (interfaz integrada)

Instalá **tres scripts separados** en Tampermonkey, pegando el archivo completo en cada uno:

1. `golden-radar.user.js` actual de esta carpeta (incluye el adaptador HUB).
2. `level-helper.user.js` actual de esta carpeta (incluye el adaptador HUB).
3. `hub.user.js` (MU · HUB 1.0.0).

Si ya tenés radar/helper, reemplazá su contenido completo y guardá; no crees copias adicionales. Conservá un solo script activo de cada módulo. Recargá el juego cuando puedas interrumpir la partida. El orden de carga es independiente. No hace falta acceder desde herramientas al editor de la extensión.

HUB aparece en la caja del minimapa: ▶/⏸ controla el ciclo, el icono de party muestra integrantes y abre los detalles, el reloj despliega el historial y el engranaje abre radar/helper. Configuración cerrada al inicio. Party siempre activa: el icono no la desactiva. Ajustes del radar y exportación siguen perteneciendo al radar; la ruta y límites del helper se muestran como información y se mantienen iguales a 1.6.0.

Sin HUB, ambos módulos conservan su interfaz independiente. Desactivar HUB requiere recargar para volver a esas interfaces. HUB no agrega intervalos, comandos de juego ni claves de almacenamiento; conserva el historial existente.

Demo integrada: `hub-preview.html`, sin cuenta ni servidor real. También se sirve en `http://127.0.0.1:4173/hub-preview.html` con `node server.cjs`. `npm run test:hub` requiere Playwright disponible (por ejemplo en `NODE_PATH`). Captura: `hub-preview.png`. Los tests existentes siguen siendo `npm test`; `npm run check` incluye los tres userscripts. La validación local no confirma movimiento ni invitaciones en una partida real.

MU Helper 1.7.0: en Lorencia, tras llegar al spot y pasar 1 segundo sin señales de ataque, skill, recogida o movimiento, busca en puntos a 3 tiles alrededor de 47,59. Evita tiles bloqueados y seguros. Detiene Home para desplazarse y lo reactiva al llegar (o tras 6 s sin llegar). Intervalo minimo de 3 s entre intentos; solo antes de nivel 50 y con ciclo activo.

Versiones de integración: Radar 1.3.4.1 y Helper 1.6.0.1 añaden solamente el adaptador de interfaz; HUB 1.0.0. Vista compacta inicial: `hub-compact-preview.png`.

MU Helper 1.7.1: si /move arena no confirma el mapa en 5 segundos, envia /move stadium una sola vez. Espera otros 5 segundos; si tampoco funciona, pausa. No cambia otros destinos ni reenvia comandos continuamente.

### Mover y bloquear HUB (1.1.0)

Pulsá el candado para desbloquear la posición y arrastrá la barra desde el título HUB o sus espacios libres. Volvé a pulsar el candado para fijarlo. Los otros botones conservan su acción y no inician arrastre. Se guarda posición y bloqueo entre recargas; la primera instalación empieza bloqueada. La posición se limita al viewport y se ajusta al cambiar el tamaño de la ventana. Clave local: `mu.hub.position.v1`; la demo usa `mu.hub.demo-position.v1`. Si el almacenamiento no está disponible, sigue funcionando durante la sesión. Actualizá solamente `hub.user.js` en Tampermonkey. Prueba específica: `npm run test:hub-position`; captura: `hub-position-preview.png`.

### Paneles separados (HUB 1.1.1)

El botón de party abre exclusivamente su panel de estado; el engranaje abre configuración de radar/helper. Abrir uno cierra el otro. La party sigue siempre activa según el motor del helper. Verificación de acciones: `node tests/hub-panels-ui.cjs` con Playwright disponible. Actualizar solamente `hub.user.js`.

MU Helper 1.8.0: siendo lider en Arena/Icarus expulsa integrantes a mas de 24 tiles o en otro mapa por 30 s. Da 30 s de gracia tras cambio de mapa/reaparicion, consulta lista cada 10 s y exige datos de lista recientes (15 s). Una expulsion por 10 s, sin repetirla al mismo nombre por 60 s; luego rellena vacantes normalmente.

HUB 1.1.2: al abrir configuracion oculta mapa, leyenda y detecciones, y ajusta su altura al contenido. Al cerrar restaura el mapa. El monitoreo y el historial siguen activos. Solo cambia presentacion del HUB.
