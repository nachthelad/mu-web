# Interfaz: barra adaptable con orbes

Diseño aprobado en el chat: script independiente, barra inferior de borde a borde sin dragones, conservando orbes, skills, pociones, coordenadas e indicadores. Desactivar el script y recargar restaura la interfaz nativa.

Adaptador inicial exclusivo para `.v097d-bottom-bar`, verificada en los recursos públicos desplegados el 2026-10-07. No modifica Store, comandos, hotkeys, eventos ni motores de otros módulos. Conserva nodos originales y sus handlers; añade únicamente presentación y copias decorativas recortadas del marco de los orbes. Otras variantes quedan intactas.

Conserva la escala nativa cuando cabe; reduce proporcionalmente si el viewport no alcanza. Fondo continuo a todo el ancho. Distribuye el bloque central y el derecho usando el espacio adicional, sin estirar sprites. El selector de skills debe seguir visible por encima de la barra. Guarda coordenadas y números mediante sus nodos originales, sin inferir valores.

Observa montaje tardío, reemplazo de barra y actualizaciones React de estilos. Usa reglas CSS propias y atributos de presentación; no reescribe los estilos nativos. Las piezas de dragón se ocultan separadamente. Un evento local `mu-interface:toggle` permite revertir la presentación en la demo y durante diagnóstico.

Verificación: demo sin cuenta, varios anchos y escala nativa, clicks/contextmenu, selector de skills, actualizaciones de números/fill, carga tardía, desactivar/reactivar y cambio de variante. Release local mediante gestor del proyecto; partida real pendiente.
