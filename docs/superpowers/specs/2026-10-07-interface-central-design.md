# Interfaz central con marco metálico

Diseño aprobado por el usuario: conservar orbes y controles, agrupar coordenadas, vida, potas, skills/menús, maná y stamina/AG en el centro. Coordenadas fuera del toggle de chat. Laterales con textura metálica inspirada en la propuesta de imagegen.

Interfaz sigue independiente. Solo modifica presentación de nodos originales; conserva handlers, hotkeys, cifras, fills, tooltips y comandos nativos. Fondo embebido, sin dependencia de una URL remota. Reversible al desactivar/recargar; sin persistencia nueva ni cambios en otros módulos.

Pruebas: 360–1920 px, orbes junto a controles, coordenadas fuera de primeros 56 px, controles dentro del viewport, textura embebida, eventos y actualización React, picker largo y reversión. Release module interface con todas las validaciones. Demo no confirma partida real.
