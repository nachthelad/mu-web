# Patrón de interfaz para addons de MU

Usar como referencia al crear o modificar addons de este proyecto. Implementaciones: `src/helper/level-helper.user.js` y `src/radar/golden-radar.user.js`.

## Estructura

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

Barra: mostrar/ocultar mapa, historial y engranaje. El minimapa y las coordenadas siguen a mano. En configuración: altura, filtro Budge, puntos históricos y exportación. El historial conserva el mapa, fecha y posición de los encuentros. Contraer no detiene la captura.

## Comprobación antes de entregar

Verificar apertura/cierre, cambio de icono y estado, foco con teclado, configuración inicial cerrada y persistencia de datos. Probar los controles en la demo local sin activar automatizaciones en la cuenta real. Guardar una captura del panel abierto.

## HUB · contrato de integración v1

`src/hub/hub.user.js` es una capa de presentación, sin motor ni intervalo. Radar y helper conservan sus instancias, temporizadores, almacenamiento y acciones. No importar/copiar `Cycle`, `AutoParty`, `Tracker` ni `Archive` al HUB.

API en el contexto de página (`@grant none`):

- `mu-hub:register`: `CustomEvent.detail = {id, host, getState, actions}`. IDs admitidos: `radar`, `helper`. `host` mantiene su Shadow DOM y sus listeners. `actions.attach()` adapta su posición/controles para montarlo en HUB; `actions.settings(boolean)` abre/cierra su panel.
- `mu-hub:discover`: HUB pide registro a módulos ya cargados. Los módulos también se registran al iniciar; funciona con cualquier orden de carga. Un ID registrado se acepta una sola vez.
- `mu-hub:state`: helper publica `{id:'helper', state}` desde su refresh existente. HUB vuelve a leer `getState()` y refleja disponibilidad, ciclo, mensaje e integrantes. No realiza polling.
- Helper: `actions.toggle()` pasa por el mismo botón standalone; nunca implementa otra ruta de comandos. Estado: `running`, `ready`, `message`, `partyCount`.
- Radar: `actions.history()` reutiliza el historial. Estado consultable: `map`, `status`, `stopped`. El mapa se actualiza en su propio DOM y scheduler.

Al recibir el registro, HUB mueve el host original, no lo clona. Sin consumidor del registro, los eventos no alteran la vista independiente. Party es siempre activa por decisión del helper; su botón HUB únicamente muestra detalles. Ningún ajuste de HUB inicia el ciclo. Para retirar HUB, desactivarlo y recargar.

Verificación local: `tests/hub-ui.cjs` comprueba carga temprana y tardía, configuración cerrada, play/pause, party, historial, independencia sin HUB, registro único y errores de navegador. La captura abierta queda en `docs/screenshots/hub-preview.png`. No se usa la cuenta real. Las demos siguen usando la clave de historial separada.
