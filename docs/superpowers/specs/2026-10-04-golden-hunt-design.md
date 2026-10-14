# Golden hunt

Diseño y ejecución aprobados en conversación el 2026-10-04, con ampliación a Lorencia y Davias y aprendizaje de requisitos de nivel.

## Comportamiento

- HUB incorpora un botón circular con la letra G, apagado al iniciar, con nombre accesible, tooltip y `aria-pressed`. La G habilita la vigilancia y puede funcionar con el leveleo apagado.
- Una señal verificada de aviso previo o inicio de Golden Dragon dispara una sola cacería por evento. No se deduce un horario ni se considera un avistamiento histórico prueba de una invasión actual.
- Ruta: Tarkan2 → Atlans2 → Atlans3 → Lorencia → Davias. Cinco minutos de búsqueda en cada destino, contados desde la llegada confirmada. La ruta completa tiene 25 minutos de búsqueda, más traslados y cierre del loot pendiente. Si llega una señal fiable de fin, se cierra la cacería después del loot pendiente.
- Los nombres Tarkan2, Atlans2 y Atlans3 designan destinos de traslado, no necesariamente mapas con IDs distintos. Se verifica llegada al destino con mapa y posición; cambiar entre Atlans2 y Atlans3 no exige que cambie el ID del mapa.
- En cada destino se visitan primero los spots de dorados guardados por Radar que correspondan a su región. Se agrupan posiciones repetidas. Luego se recorren puntos transitables para ampliar la búsqueda; si se agotan los puntos, se continúa patrullando hasta cumplir los cinco minutos. No se alteran ni borran avistamientos.
- Un dorado vivo recibido por el cliente tiene prioridad sobre la patrulla. Se usan los tipos auditados de Radar y se descartan NPC, enemigos comunes, muertos y entidades fuera de alcance.
- Se recogen los Box of Kundun que dejan los dorados antes de continuar o salir del destino. Se exige la confirmación de inventario de un Kundun; desaparición o salida de scope no prueban recogida; emitir una solicitud no equivale a haberlo obtenido. Inventario lleno, rechazo o timeout se muestran como errores de loot, nunca como éxito.
- Al terminar, la G permanece habilitada esperando el próximo evento. El leveleo se retoma solo si su botón sigue activo. Apagar Helper durante la cacería impide la reanudación; activar Helper durante ella deja el leveleo pendiente hasta terminar.
- Apagar G cancela la cacería y sus acciones pendientes. Si Helper sigue activo, vuelve a su ruta. No se dejan ataques, recogidas o movimientos propios en cola.
- Antes de cada traslado se compara el nivel con el requisito conocido para ese destino y clase. Si falta el dato, se prueba `/move` una sola vez y se aprende el nivel explícito de la respuesta del servidor. Un traslado exitoso no inventa un mínimo. Rechazos por dinero, PK o destino inválido no se registran como nivel. Se guardan requisitos por personaje/clase en una clave nueva, sin alterar las existentes; la demo usa otra clave. Los destinos inaccesibles se omiten y se informa el motivo.

## Arquitectura

HUB conserva su papel de presentación. El motor de cacería vive en la fuente de Helper y comparte su refresh y el servicio de acciones existente. Durante la cacería se suspende el paso de leveleo, sin cambiar la intención del botón Helper; no hay dos emisores de movimiento o combate simultáneos.

Radar conserva Tracker, Archive y su scheduler. Expone de forma aditiva datos de avistamientos y señales verificadas del evento para que Helper los consuma. Se conserva contrato v1, las acciones existentes y todas las claves de almacenamiento. Las capacidades nuevas se detectan antes de usarlas: con un módulo antiguo o ausente se muestra disponibilidad real y no se disparan acciones incompletas.

El estado de Golden hunt informa espera, traslado, patrulla con tiempo restante, combate, loot, finalización y error. Abrir configuración o contraer la interfaz no cancela la vigilancia.

## Verificación del cliente antes de programar acciones

Se debe inspeccionar la implementación upstream del cliente para identificar el aviso previo, el estado de invasión, los comandos y coordenadas de destino, el movimiento por terreno, el ataque a una entidad y la identificación/recogida de Kundun. El paquete MapEventState actual confirma estado de evento, pero el código local no demuestra aún una señal de preaviso.

No se inventan firmas, IDs de objetos, coordenadas ni horarios. Si el cliente no ofrece preaviso comprobable, se documenta esa limitación y se inicia con la señal de comienzo comprobada. Si una capacidad esencial de movimiento, ataque o loot no está disponible, la cacería se pausa con una razón visible.

Los spots históricos de Atlans/Tarkan se asignan por proximidad a los centros de gates verificados en el cliente; es una heurística, no una frontera del servidor. Los puntos no asignables no se usan para cruzar inadvertidamente a la otra región; siguen intactos en Radar.

## Errores y recuperación

Desconexión, cambio de personaje, error de cliente, traslado rechazado o falta prolongada de progreso detienen las acciones propias y muestran la causa. No se reanudan acciones pendientes de otra sesión. La muerte suspende acciones hasta reaparecer; tras confirmar personaje y destino se puede continuar con el presupuesto de tiempo restante. La carga de mapas no envía acciones de combate o loot.

La navegación evita puntos bloqueados y zonas seguras para combatir. Un punto histórico inaccesible se omite tras un intento acotado, sin bloquear los cinco minutos del destino.

## Validación y entrega

Pruebas de lógica: evento único, cinco minutos por destino, regiones con el mismo ID, prioridad de spots y objetivos, loot confirmado y fallido, cancelación, muerte/desconexión y reanudación según estado actual del Helper.

Demo integrada: G apagada inicialmente, activación, evento simulado, recorrido de los cinco destinos, ataque/loot simulados, reanudación, registro temprano/tardío y compatibilidad con capacidades ausentes. Captura del panel abierto. No se usa cuenta real.

Se incrementan versiones de las fuentes modificadas, se actualizan contrato/documentación y changelog, y se ejecuta `npm run release` con sus validaciones completas. Se preservan los cambios preexistentes del proyecto. Los instalables se entregan desde dist; no se instala Tampermonkey ni se publica en Internet. La demo no confirma funcionamiento en partida real.
