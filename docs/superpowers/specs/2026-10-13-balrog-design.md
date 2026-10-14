# Caza: viaje al Balrog Colosal

Diseño del 2026-10-13, ajustado con la indicación del usuario: activar Home al llegar y liberarlo después de Pausa para uso manual. Implementación autorizada en este chat.

## Objetivo

Habilitar Caza desde Config y mostrar un Play/Pausa en juego durante el evento con destino válido. Play inicia un único viaje al mapa y coordenadas recibidos. No agrega combate, loot ni reactivación de Golden hunt.

## Evidencia actual

Consulta pública sin cuenta del 2026-10-13: https://mu.mormon.garden/ carga index-Drn8eqTh.js, boot-ggOjq5Um.js y layout-DJi2NQ83.js. Copias consultadas en artifacts/balrog-research.

El layout contiene Balrog Colosal (catálogo de monstruos 694), traducciones serverMessage.bigBossAppeared, bigBossStillOut y bigBossLeft y lector nativo Uxt (export ee). Reconoce mensajes mediante CO; conserva mapa, x, y, at y kind. Un mensaje invasionMonsterDefeated del Balrog también cierra el evento. El formato inglés alternativo The Big Boss is already out incluye mapa y coordenadas.

El lector limita la aparición a 30 minutos y conserva el inicio cuando recibe StillOut. Su horario usa horas UTC 1,4,7,10,13,16,19,22, minuto 0. Esto describe el código publicado, no los horarios previamente dados por el usuario ni una comprobación del servidor. Su período scheduled puede devolver running sin destino: nunca habilita viaje por sí solo.

El HUD Big Boss muestra mapa y coordenadas cuando las tiene. Falta completar antes de implementar la auditoría del transporte ServerMessage, identidad autenticada y resolución exacta de mapas/variantes. Ninguna consulta usó cuenta real.

README y changelog confirman retiro de G/Goldens desde Helper 1.24.2/HUB 1.4.7. No se restaura esa automatización; Caza será una sección nueva con el ajuste Balrog.

## Alternativas

1. Recomendada: lector pasivo del evento y viaje dentro del scheduler de Helper, con controles proyectados a HUB/panel. Reutiliza arbitraje, navegación y Home, evitando dos autoridades de movimiento.
2. Addon separado con motor propio: independiente al instalar, pero necesita un nuevo arbitraje con Helper. Agrega complejidad sin ventaja para este pedido.
3. Ir por horario y coordenadas manuales: no satisface el destino aleatorio anunciado; descartada.

## Interfaz y comportamiento propuestos

- Sección Caza; switch Balrog apagado por defecto en preferencias por mundo/cuenta. Habilitar no viaja.
- Play/Pausa compacto dentro del juego, visible solo con switch activo y señal vigente de Balrog con destino completo validado. Estado equivalente en panel externo; mismos handlers en standalone.
- Play requiere un clic para cada evento. Muestra mapa, X/Y y estado. No se rearma para eventos siguientes.
- Al iniciar, pausa el leveleo, confirma que Home se detuvo y toma control de navegación. Bloquea el inicio si hay reset o warp anterior sin resolver; informa el motivo.
- Al llegar, confirma mapa y posición reales y activa Home usando skills/pociones configuradas en el juego. Caza permanece activa hasta Pausa o fin del evento; leveleo queda pausado para no volver al spot. Pausa detiene Home, espera confirmación y libera el control para activarlo manualmente con el teclado.
- Pausa, apagar el switch, fin/vencimiento, muerte, desconexión o cambio de identidad cancelan nuevas acciones. Una orden ya enviada puede completar; no se promete revertir un warp enviado.
- Si cambia el destino durante el viaje, pausa y exige otro clic sobre el nuevo destino, evitando redirecciones silenciosas.
- Tiempo e intentos acotados para Home, acceso y navegación; rechazo o falta de progreso pausa con motivo. Home manual conserva su uso tras liberar control.

## Implementación y validación previstas

Helper conserva autoridad de movimiento y utiliza su refresh y mecanismos nativos verificados. HUB y puentes solo proyectan controles/estado. Mantener contrato v1, claves existentes y preferencias históricas gold; acción gold sigue inerte. Confirmar el transporte real antes de fijar adaptadores; no basar el reconocimiento en horarios ni catálogo de monstruos comunes.

Fixtures de anuncios, descarte de mensajes ajenos, fin y vencimiento; viaje y llegada; pausa y respuestas tardías; identidad; Home manual; reset/warp pendientes; rechazo y navegación sin progreso. UI de Caza, botón condicional, panel y standalone. Regresión de Golden hunt retirado y contador informativo intacto.

Después de aprobar: plan detallado, implementación, documentación/versiones, validaciones obligatorias y release local. No instalar en navegador ni publicar web. Distinguir datos públicos, demos locales y partida real pendiente. Preservar modificaciones previas presentes en el workspace.
