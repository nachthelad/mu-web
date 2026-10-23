# Mapas y spots de leveleo · Helper 1.23.0

En el **Centro de control → Leveleo**, elegí cualquiera de los 26 destinos del catálogo, incluido Icarus y las variantes de Arena, Atlans, Lost Tower y otros mapas. No requiere localhost. La configuración también funciona con los userscripts y Config existentes.

1. Elegí un mapa y activá **Usar este mapa**.
2. Indicá **Desde nivel**, respetando el mínimo que se muestra para tu clase.
3. Agregá uno o varios spots con coordenadas X/Y. Podés duplicarlos, eliminarlos o deshabilitarlos sin borrar sus datos.
4. **Usar ubicación actual** captura solamente coordenadas del destino seleccionado. Si estás en otro mapa, durante carga o muerte, cambió el personaje, o el ID identifica varias variantes, rechaza la captura y conserva el spot.
5. Guardá. Guardar aplica el borrador; Cancelar/Escape lo descarta. Guardar no inicia Play.

El selector siempre muestra todos los mapas. Un mapa habilitado sin spots habilitados aparece como incompleto y se omite de la progresión. Sin ningún mapa utilizable, Play se bloquea con una explicación. La lista de progresión muestra los destinos completos ordenados por nivel.

## Comportamiento durante Play

Al comenzar una etapa elige **un solo spot habilitado** y permanece ahí hasta alcanzar el nivel de la siguiente etapa o hacer reset. No cambia por tiempo, ausencia de enemigos ni cantidad de monstruos. Al superar el siguiente umbral empieza el traslado aunque esté atacando; se respetan la prioridad de Golden hunt, los comandos pendientes y sus límites de envío. Si iniciás con nivel alto, elige directamente la etapa habilitada de mayor nivel que ya alcanzaste.

En visitas posteriores al mapa usa el siguiente spot, evitando repetir el anterior si hay más de una coordenada distinta. Pausa/reanudación, muerte y regreso de Golden hunt conservan la elección. Reset confirmado inicia una visita nueva. Mapas con igual nivel forman una etapa: elige uno de forma estable y avanza al siguiente en otra visita, sin oscilar entre ellos durante el leveleo. El historial de turnos dura lo que vive el documento; recargarlo reinicia los turnos.

Desde Helper 1.29.4, al iniciar o reanudar en un mundo compartido por varias variantes (por ejemplo, Devias y Devias 2–4), no vuelve a transportarse si ya está a dos casillas o menos del spot elegido. Se usa la misma distancia de llegada del ciclo; compartir el ID del mundo por sí solo no identifica una variante. Más lejos conserva el viaje explícito y espera su confirmación antes de caminar al spot. Un cambio de etapa a otra variante del mismo mundo también conserva el viaje, incluso cerca del nuevo spot. Llegar a las coordenadas durante un viaje pendiente no reemplaza su confirmación. La zona segura sigue impidiendo activar Home.

Por debajo del primer nivel configurado permanece en el mapa inicial; puede usar un spot del mapa actual si ese destino se identifica sin ambigüedad. No viaja antes del mínimo de clase. Un viaje rechazado o sin confirmación, un spot no transitable o sin camino completo, o 45 segundos sin progreso pausan con motivo; no rota silenciosamente a otro spot. El loot usa el centro del spot elegido.

## Configuración anterior y datos

Abrir Config prepara un borrador a partir de la ruta seleccionada y sus alternativas; no escribe almacenamiento. Guardar incorpora `leveling: {version:1,maps:[{map,enabled,level,spots:[{x,y,enabled}]}]}` dentro de las preferencias v1 existentes. Conserva las claves por mundo/cuenta y los campos originales `path`, `routes`, `selectedRoute`, `varySpots` como respaldo. No cambia el contrato v1 de HUB ni agrega motores.

Si una ruta anterior repite un mapa con niveles distintos, conserva el primer nivel y muestra una advertencia para revisión; el original completo sigue disponible. No mezcla silenciosamente esos tramos. **Recuperar configuración anterior → Editar formato anterior**, seguido de Guardar, restaura el recorrido anterior. Cancelar conserva el formato vigente. El editor anterior queda como recuperación; su variación tampoco cambia de spot por tiempo.

## Observaciones opcionales

La ayuda con concentraciones observadas puede agregar sugerencias del mapa seleccionado como spots **deshabilitados** para revisar, habilitar y guardar manualmente. No cambia la selección activa ni inventa coordenadas. La captura pasiva existente requiere cuatro monstruos únicos en radio seis y tres muestras cada cinco segundos durante diez segundos; un intervalo mayor a quince segundos reinicia la evidencia. Excluye NPC, muertos y eventos. Solo describe entidades cercanas recibidas.

El archivo `mu.level-spots.v1.<scope>` conserva hasta 120 registros durante 14 días, separado por mundo/cuenta/servidor, con Web Locks. La captura automática sigue limitada a IDs inequívocos de Lorencia, Noria y Arena 1–4; los spots manuales admiten todos los destinos. Datos inválidos se conservan para recuperación. No explora todo el mapa autónomamente.

## Validación

Pruebas de lógica en `tests/map-leveling.test.cjs` y de edición en `tests/map-leveling-ui.cjs`; el conjunto incluye regresión del editor recuperable y del panel MV3 con fixture aislado. Se verifican permanencia, umbrales con enemigos, reset, pausa/muerte/regreso, empates, variantes y validación de captura, Guardar/Cancelar/recarga. Estas pruebas no confirman spawns ni navegación en partida real.
