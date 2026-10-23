# Recogida independiente de Kundun

Diseño aprobado por el usuario en este chat el 18/10/2026: opción separada para Kundun +1 a +5 por tipo real, sin nombres, Excellent/Luck ni llegada/radio del spot. Usa el rango existente desde el personaje, Play y Home activos, y muestra motivos de espera. No requiere una invasión activa.

Se conserva un solo picker, scheduler, contrato y almacenamiento v1. `loot.kundun` es booleano opcional, false por defecto. Guardar/Cancelar y el panel externo reutilizan los controles originales. El interruptor maestro de loot sigue siendo obligatorio. Cajas válidas: group 14, num 11, lvl 8 a 12 en el item serializado, no en el modelo visual.

Kundun tiene prioridad sobre categorías normales y el retorno al spot mientras existe una recogida pendiente. Viajes, cambios de etapa, reset, caza, muerte, carga, conflictos Home y targets manuales conservan prioridad. No se inicia Home ni Play desde este ajuste. No se recogen otros objetos fuera del spot. Un rechazo Kundun admite hasta tres intentos espaciados por 2 s, luego espera 60 s; los otros items conservan su política.

Validar lógica, integración del scheduler, confirmaciones/rechazos, persistencia y cancelación en demo sin cuenta. Release oficial local obligatorio, sin push, instalación ni recarga del juego. La simulación no confirma aceptación del servidor en partida.
