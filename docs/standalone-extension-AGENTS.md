# Crear una extensión independiente de MU para un personaje o clase

Este archivo es autocontenido: copiarlo como `AGENTS.md` en la raíz de un proyecto nuevo y dar al agente el objetivo de la extensión. No requiere acceso al repositorio original. Es una guía de trabajo, no una extensión ejecutable ni una plantilla de código ya probada.

## Objetivo y alcance

Crear una extensión Chrome Manifest V3 independiente para el cliente web de MU. Tendrá sus propias fuentes, manifiesto, interfaz, identidad, almacenamiento, pruebas y distribución. Debe funcionar sin instalar otra extensión, Tampermonkey, HUB, Config, Radar, Helper ni un servidor local de desarrollo.

Antes de implementar, definir con el usuario la clase/personaje objetivo y las acciones concretas que necesita. “Extensión de personaje” puede significar una clase completa, un build/rol o un personaje individual; distinguirlos. No deducir que hay que implementar todo un sistema de leveleo/reset/loot/party para una función pequeña.

Crear todos los archivos y generar instalables dentro del proyecto nuevo. No modificar, empaquetar ni publicar el proyecto de origen para obtener esta extensión. Si está disponible como referencia, consultarlo en lectura y reutilizar solamente piezas necesarias con sus dependencias identificadas.

## Conocimiento técnico de partida

La arquitectura fue observada en un proyecto local para `https://mu.mormon.garden/*`, revisado el 18/10/2026. Estos datos son puntos de investigación, no garantía de compatibilidad con un cliente futuro ni con otros servidores MU.

El cliente exponía:

| Interfaz | Datos o funciones observados |
| --- | --- |
| `window.__store` | Conexión, UI, `playerData`, skills, buffs, estado de MU Helper y métodos nativos. |
| `window.__world` | Mapa, héroe, entidades, movimiento y solicitudes de acciones. |
| `window.__social` | Party y `sendChat` para comandos oficiales. |
| `window.__eventBus` | Eventos del cliente; entre ellos `experienceGained`. |

El personaje estaba en `__store.playerData`, con `name`, `charClass` y `level`. La posición estaba en `__world.playerEntity.transform.pos`; X/Y del mapa correspondían a `pos.x`/`pos.z`. `__world.mapIndex` identificaba el mapa.

La conexión se comprobaba mediante `__store.gsSocket.readyState === 1`, `connectionLost` e `isOffline`. Se observaban estados UI 3/4/5 para selección de personajes/carga/mundo; `uiState === 5`, carga terminada y héroe válido eran condiciones necesarias para actuar en el mundo. Revalidar los valores y campos antes de usarlos en producción.

Se observaban `store.muHelper.active`, `store.toggleMuHelper()`, `store.warpCommandRequest()`, `store.selectSkill()`, `store.selectCharacterRequest()` y `__social.sendChat()`. Son métodos internos del juego; verificar existencia, firmas, precondiciones y confirmación de efecto. No son APIs oficiales del navegador ni contratos estables.

`playerData.charClass` usaba valores de CharacterClassNumber; en el proyecto de referencia 12/13 correspondían a MG/Duel Master. No completar el catálogo por analogía ni confundirlo con otros enums de clase. Auditar la clase/evoluciones de esta extensión y las skills necesarias en el cliente objetivo.

No adivinar fórmulas de daño, IDs de skills, buffs, cooldowns, requisitos de mapas ni formatos binarios. Registrar evidencia y build del cliente para cada dependencia. Una habilidad aprendida, el rol y el equipo no se infieren solamente de `charClass`.

## Elegir la arquitectura mínima necesaria

Si basta una interfaz dentro del juego, usar un content script en MAIN con su propio motor y UI aislada. Agregar worker y puente ISOLATED únicamente si se necesitan APIs de extensión o una interfaz fuera del documento del juego.

Para un panel en pestaña propia, separar estas responsabilidades:

```text
panel de extensión
  ↕ mensajería Chrome
service worker: abrir/enfocar panel y enrutar por tabId/frame
  ↕ mensajería Chrome
content script ISOLATED: puente limitado
  ↕ window.postMessage
adaptador MAIN y motor del personaje
  ↕ estado/métodos del cliente existente
cliente del juego → servidor MU
```

Los motores que usan objetos del cliente viven en la pestaña del juego. El worker no conserva referencias a esos objetos ni ejecuta un segundo motor. La extensión no abre una conexión paralela al servidor para sustituir al cliente.

MAIN permite integrar los objetos de la página; ISOLATED separa el puente que usa APIs Chrome. El proyecto de referencia declaraba el puente MAIN en `document_start` y motor/puente ISOLATED en `document_idle`. Elegir el orden según las dependencias del proyecto nuevo y esperar disponibilidad real del cliente: `document_idle` no demuestra que el personaje esté listo.

El manifiesto debe declarar únicamente archivos existentes del proyecto nuevo, el dominio objetivo exacto, documento principal y permisos necesarios para sus funciones. Si se usa el mismo diseño del proyecto de referencia, Chrome 120 era su mínimo declarado; verificar requisitos de las APIs realmente elegidas. No copiar un manifiesto que enumere los seis módulos de la extensión anterior.

Mantener scripts del panel dentro del paquete, CSP restrictiva y ausencia de dependencias ejecutables remotas. No ampliar permisos para ocultar fallos del adaptador. No prometer funcionamiento con pestañas congeladas/descartadas: Chrome puede suspenderlas y el worker también tiene ciclo de vida propio.

## Organización sugerida del proyecto nuevo

```text
AGENTS.md                  este archivo
README.md                  objetivo, instalación, uso y límites
src/manifest.json          manifiesto fuente, o generador documentado
src/game-adapter.js        snapshot y llamadas verificadas al cliente
src/character-policy.js    condiciones/decisiones específicas de la clase
src/engine.js              coordinación y ejecución de acciones
src/game-ui.js             controles dentro del juego, si corresponden
src/content-bridge.js      opcional, mundo ISOLATED
src/page-bridge.js         opcional, transporte MAIN
src/worker.js              opcional, APIs y enrutamiento de extensión
src/panel/                 opcional, interfaz externa
scripts/                   build, check y empaquetado propios
tests/fixtures/            cliente simulado y casos reproducibles
docs/                      evidencia del cliente y decisiones
dist/                      extensión instalable generada
```

Se pueden unir archivos para una función pequeña. La separación de responsabilidades importa más que reproducir esta cantidad de archivos. Elegir entre manifiesto fuente o generado, con una única fuente de verdad. No editar manualmente artefactos de `dist`.

No es obligatorio soportar userscripts, registro `mu-hub:*`, proveedores de Config ni proyección de DOM. Esos contratos pertenecen a la extensión anterior. Para una extensión nueva, una interfaz propia y mensajes de estado/acciones explícitos suelen bastar; no copiar el renderer genérico si no se necesita.

## Reglas del motor del personaje

- Obtener un snapshot validado y distinguir desconectado, cargando, listo, muerto y clase incompatible. La ausencia de datos no equivale a cero ni a permiso para actuar.
- Verificar clase y habilidades antes de activar funciones específicas. Para clase desconocida/incompatible, explicar el estado y bloquear esas funciones.
- Mantener un único dueño de movimiento, Home, casteo y recogida dentro de esta extensión. Integrar las políticas en su scheduler; no crear un intervalo por habilidad.
- Comprobar recursos, buff activo, skill aprendida, cooldown y solicitudes pendientes. Si Home ya administra una función, evitar competir con él.
- Diferenciar intención, envío y confirmación. Invocar un método no confirma un warp/reset/cast. Aplicar timeout y límites de reintentos según la acción; no reenviar ciegamente acciones con resultado incierto.
- Play/Pausa deben ser explícitos. Cambiar ajustes o restaurar preferencias no inicia acciones, salvo una función de programación solicitada y habilitada expresamente.
- Al pausar o cambiar identidad/clase, invalidar trabajo pendiente incompatible. Detener únicamente acciones que la extensión controla; liberar después el control manual. No cancelar indiscriminadamente acciones ajenas.
- Registrar una marca de instancia y limpiar listeners/timers al destruirse el documento. Una marca propia evita duplicarse a sí misma, pero no coordina con otras extensiones.

Una extensión independiente no implica coexistencia automática con otros automatizadores. Si otra instalación controla Home/movimiento/skills, detenerla antes de probar esta o diseñar un protocolo de exclusión entre ambas. Cambiar solamente el nombre de la marca no evita dos motores compitiendo.

## Identidad y datos propios

Usar prefijos únicos de este proyecto para claves, eventos, canales, hosts DOM y marcas de instancia. No escribir las claves `mu.level-helper.*`, `mu.golden-radar.*`, `mu.analytics.*` ni otros datos de la extensión anterior.

Elegir y documentar el almacenamiento por dato. Las preferencias propias pueden vivir en almacenamiento de extensión con el permiso correspondiente; datos que deban leerse en MAIN requieren un puente acotado o almacenamiento del origen con prefijo propio. No copiar automáticamente toda la configuración de otra extensión.

Para ajustes de un personaje individual, definir identidad con mundo/cuenta/personaje y agregar servidor cuando corresponda. Si la cuenta no puede resolverse de forma autenticada, bloquear escrituras y acciones sensibles. Para ajustes comunes a una clase o presets, distinguirlos del estado operativo de un personaje.

En el cliente observado, la cuenta se resolvía desde `__store.username` y el mundo desde el segmento anterior a `/` de `accountFor`, solo con sesión autenticada. No persistir ni transmitir el valor completo de `accountFor`, contraseñas o almacenes de credenciales. No usar el nombre de personaje como sustituto de cuenta.

Versionar el esquema. Validar datos al leer; conservar registros inválidos y mostrar recuperación en lugar de sobrescribirlos. Definir qué pasa con guardados concurrentes, cambios de cuenta, valores por defecto y rollback. Instalar varias extensiones no aísla su acceso a `localStorage` del mismo origen.

## Si existe mensajería entre panel y juego

Definir protocolo propio versionado con operaciones concretas. Validar remitente, origen, pestaña/frame destino, tipos y tamaños. No aceptar código, selectores arbitrarios, comandos libres ni lecturas genéricas de almacenamiento.

Usar IDs de solicitud, timeout y descarte de respuestas antiguas. Una conexión del panel debe asociarse al documento y a la identidad de sesión; recarga, logout o cambio de personaje invalidan la conexión y sus acciones pendientes. Requerir reconexión explícita antes de actuar sobre otra sesión.

Un canal UUID y una lease previenen cruces accidentales, pero MAIN e ISOLATED comparten documento; no tratarlos como autenticación frente a código hostil de la propia página. El worker debe verificar el panel exacto de su extensión y limitar los destinos al juego autorizado.

Cerrar/desconectar el panel y pausar el motor son acciones diferentes: definirlas y explicarlas en la interfaz. No mantener una copia editable de preferencias que pueda sobrescribir silenciosamente otra sesión.

## Validación y entrega

Primero construir fixtures sin cuenta real. Cubrir clase compatible/incompatible, cliente ausente, cambios de identidad, recursos insuficientes, Home manual, pause, confirmaciones, timeouts, recarga, instancia duplicada y conflictos de configuración. Añadir solamente casos pertinentes a las acciones implementadas.

Para panel externo, probar destino explícito, reconexión, respuestas de sesión anterior y mensajes inválidos. Para distribución, comprobar que el manifiesto referencia todos los archivos necesarios y que la extensión funciona con las demás extensiones MU desactivadas, sin leer recursos del proyecto de referencia.

Ejecutar comprobaciones de sintaxis/lógica y validaciones de navegador adecuadas al alcance autorizado. Para navegador, usar un perfil desechable y fixtures interceptados; bloquear conexiones al servidor real. Validar también el paquete final, no solamente las fuentes. Una simulación no demuestra aceptación del servidor ni funcionamiento con un personaje real.

El proyecto nuevo debe tener sus propios comandos de build/validación/release; crearlos y documentarlos. No asumir que `npm run release -- --module helper` ni los scripts del repositorio anterior existen o sirven aquí. Versionar la extensión, generar una carpeta instalable completa y, si se pide, ZIP/checksum. No incluir sesiones ni datos personales.

Entregar ubicación del instalable, instrucciones para cargarlo, controles de uso, comprobaciones realmente ejecutadas y limitaciones pendientes. No instalar en el navegador habitual, usar cuenta real, hacer push ni publicar sin autorización específica. Un cambio de documentación no requiere generar una extensión.

## Primera tarea al recibir este archivo

Confirmar el sitio y el objetivo del personaje con el pedido del usuario. Inspeccionar la carpeta nueva, decidir la arquitectura mínima y documentar hechos comprobados frente a hipótesis. Si faltan clase/rol o acciones objetivo, pedir esos datos antes de implementar reglas de personaje; se puede avanzar con investigación sin inventarlos. Esta guía permite iniciar el proyecto sin la extensión anterior, pero no determina por sí sola qué debe hacer el personaje.
