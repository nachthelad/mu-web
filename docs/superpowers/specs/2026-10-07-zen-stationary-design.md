# Zen sin moverse

Cambio aprobado por el usuario: el interruptor existente Zen se llama «Zen sin moverse» y recoge únicamente dinero ya dentro del alcance inmediato del cliente. Se conserva la clave loot.zen y su estado guardado. No se pide una nueva confirmación: el usuario aprobó expresamente ignorar el Zen fuera del alcance actual.

Usar el alcance nativo de ItemPickupSystem: distancia Chebyshev de casillas truncadas <= 1. La recogida usa Store.pickupItemRequest directamente, sin escribir pickupTarget, playerMoveTo ni pathfinding. Esto evita que el sistema de aproximación camine si combate cambia la posición después de elegir el drop. El servidor conserva validación de alcance/propiedad/inventario. La confirmación de dinero, rechazo, timeout y cooldown existentes permanecen.

Todos los drops de dinero se limitan a este alcance, incluso con Recoger todo; el rango configurable sigue para los demás items. No cancelar movimientos de combate ni manuales: el addon no inicia movimiento por Zen. Verificar casilla propia/adyacente/diagonal, distancia 2, decimales, rango 1/8, Todo, pausa/cacería, no modificar caminos y cooldown. Actualizar Helper a 1.13.1, documentación y capturas; release local con todas las validaciones. Demo no confirma recogida real.
