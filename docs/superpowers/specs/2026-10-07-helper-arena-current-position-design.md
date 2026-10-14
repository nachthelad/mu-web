# Helper: llegada a Arena y precarga de posición

## Alcance aprobado

Agregar mapa en Leveleo captura el mapa, nivel y coordenadas actuales al hacer clic. Los campos siguen editables y no se persisten ni aplican hasta Guardar. Cancelar descarta la fila. No inicia Play ni envía comandos.

Las coordenadas se convierten a casillas enteras con Math.floor. Si el cliente solo informa el terreno compartido de Arena, se selecciona Arena base; el usuario elige 2/3/4. Igual criterio para otros terrenos con variantes. No deducir variantes por nivel o proximidad. Si no hay personaje listo o mapa reconocido, conservar la incorporación manual. Un nivel fuera de 1–399 o debajo del mínimo no se inventa: queda pendiente de corrección mediante la validación existente. Los niveles deben conservar el orden creciente; no cambiar otras filas automáticamente.

## Revisión de Arena

El código actual fija map=6 para las cuatro Arenas y, en traslados dentro del mismo mapa, exige warpSerial posterior al comando. Solo MapChanged y MapChanged075 incrementan ese contador. Las pruebas actuales simulan map=6 y ese evento, por lo que no prueban el bloqueo observado por el usuario.

El cliente público normaliza MapChanged075 a MapChanged; su handler maneja tanto cambios de mapa como teleports internos. Esto no confirma el ID real ni los paquetes de la partida del usuario. Antes de elegir una corrección, reproducir una llegada con los datos reales del protocolo o identificar una discrepancia verificable en el adaptador. No sustituir confirmación por una demora fija ni asumir que cualquier movimiento demuestra llegada.

## Validación y entrega

Agregar regresiones de las tres variantes con movimiento hacia un spot distinto del punto de llegada, inicio y transición desde Arena, rechazo y falta de confirmación. Comprobar precarga al hacer clic, campos editables, Cancelar y Guardar, datos no disponibles y validación de niveles. Conservar motores, contrato y almacenamiento v1. Incrementar Helper, actualizar changelog/README y ejecutar release local del módulo con todas las validaciones. Entregar dist sin instalar en el navegador. Las demos no confirman partida real.
