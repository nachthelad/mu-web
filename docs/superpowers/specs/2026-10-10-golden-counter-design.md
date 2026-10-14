# Contador de Golden Invasion

Pedido autorizado por el usuario: pedir prompt a PROMPTER, recuperarlo y ejecutar aquí. Panel dentro del juego con total, movimiento y candado como minimapa.

Se elige un host independiente del Radar: reutiliza su estado nativo y tick, permanece visible en extensión y standalone y no modifica el minimapa. Integrarlo al host del minimapa lo ocultaría junto a él; crear otro módulo duplicaría infraestructura sin necesidad.

Cabecera compacta Golden Invasion, total nativo o Sin datos y candado accesible. Tooltip opcional de mapas. Visible solo durante invasión activa; no suma mapas parciales para inventar un total. Sin controles de automatización. Posición y bloqueo persistentes propios, datos de invasión solo en memoria.

Identidad, desconexión, nueva invasión y expiración evitan mostrar cantidades anteriores. Invalidación limitada a la vista, preservando Golden hunt. Arrastre con pointer capture, controles aislados del juego y posición limitada al viewport. No se agregan intervalos.

Aceptación: demos con total 6 frente a cero avistamientos, actualizaciones, cero explícito, total ausente con mapas presentes, expiración HUD/paquete, recarga, candado, viewport reducido, extensión, Play pausado y cambio de identidad. Pruebas generales y release local obligatorio; sin instalación ni cuenta real.
