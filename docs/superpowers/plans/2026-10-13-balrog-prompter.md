# Prompt recibido de PROMPTER

Origen: chat PROMPTER, 01a118e8-f939-7341-9a6b-eca81c0d9059. Recibido el 2026-10-13. Pendiente de implementación.

Implementá en `D:\Cosas\Dev\mu-web` una función para **dirigirse al mapa y coordenadas anunciados por el juego durante el evento del Balrog gigante**.

El usuario quiere habilitarla desde una sección **Caza** y disponer de un botón Play/Pausa dentro del juego, visible únicamente cuando haya un evento activo con destino válido. **El alcance es viajar y llegar al destino; no agregar combate especial ni loot.**

Leé `AGENTS.md`, `README.md`, `docs/organization-and-updates.md`, `docs/addon-design.md`, `docs/extension-panel.md`, `docs/account-settings.md` y las fuentes relevantes. Investigá, presentá un diagnóstico y plan breve y continuá con la implementación de lo verificable.

**Estado actual y alcance**

La documentación indica que desde Helper 1.24.2/HUB 1.4.7 se retiraron G y Goldens, la acción histórica quedó inerte y el puente la rechaza. Verificá el estado vigente.

Creá la sección visible **Caza** para esta función; no asumas que Goldens sigue disponible ni reactives la cacería automática de dorados. Conservá el contador informativo de Golden Invasion, sus cantidades por mapa, minimapa e historial.

**Investigación del evento**

- Identificá en el cliente público actual la señal real del Balrog gigante: anuncio, paquete o estado que permita reconocer el evento, mapa y coordenadas.
- Verificá cómo distinguirlo de otros Balrogs/eventos y cómo conocer su inicio, cambios de destino, final y vigencia.
- No inventes APIs, IDs, nombres de paquetes o coordenadas ni equipares variantes de mapa que comparten assets.
- El usuario menciona horarios compartidos anteriormente. Buscalos en documentación o historial disponible y registrá su procedencia si aparecen. No los confundas con Golden Invasion.
- Los horarios pueden servir como referencia, pero **no prueban que el evento esté activo ni proporcionan un destino**.
- Si la señal solo existe como texto, validá su formato y límites; descartá mensajes incompletos, ambiguos o antiguos.
- Si no encontrás una señal verificable de destino, entregá el bloqueo concreto y qué evidencia falta. No sustituyas el pedido por una ruta inventada o presencia inferida del horario.

**Configuración y controles**

- Agregá en Caza un switch para habilitar/deshabilitar el desplazamiento al Balrog, apagado por defecto y persistido según las convenciones actuales por mundo/cuenta.
- Habilitar o guardar la preferencia **no inicia un viaje**.
- Mostrá dentro del juego un botón Play/Pausa compacto solo si la función está habilitada y existe un evento activo con destino válido y vigente.
- Play requiere una acción explícita del usuario para ese evento. No se rearma automáticamente para el siguiente.
- Mostrá destino, estado de viaje, llegada o motivo de bloqueo. La llegada debe confirmarse mediante mapa y posición reales, no por el envío de un comando.
- Ofrecé estado y controles coherentes en el Centro de control externo, vinculados a la sesión correcta. Conservá standalone Tampermonkey.
- Reutilizá patrones visuales existentes sin duplicar motores ni preferencias.

**Movimiento y cancelación**

- Elegí el módulo propietario según las responsabilidades actuales y reutilizá sus mecanismos verificados de warp, navegación y confirmación.
- Coordiná con leveleo, Home, reset y transiciones pendientes: una sola autoridad debe controlar el movimiento.
- Al iniciar el viaje, suspendé el leveleo de forma explícita y registrá la intención previa. Definí la devolución de control al llegar o finalizar, respetando la intención vigente de Play y sin iniciar un bot que estaba pausado.
- No interrumpas a medias una solicitud de reset/warp ya enviada ni declares cancelada una operación que necesita confirmación. Invalidá las acciones posteriores que ya no correspondan.
- Pausa, deshabilitación, fin del evento, destino vencido, logout o cambio de identidad deben detener nuevas acciones del desplazamiento y evitar reintentos tardíos.
- No interfieras con Home iniciado manualmente cuando Helper está pausado; resolvé y documentá el arbitraje antes de iniciar este viaje.
- Validá requisitos de acceso y transitabilidad. Limitá intentos ante rechazo, obstáculos o falta de progreso, informando el motivo sin bucles.
- Al llegar, terminá la tarea de desplazamiento. No persigas al monstruo, ataques, recojas objetos ni agregues lógica de combate.

**Compatibilidad y validación**

Preservá cambios ajenos, contrato v1, claves y preferencias existentes. Agregá únicamente las capacidades necesarias; la antigua acción `gold` debe seguir inerte.

Probá con demos/fixtures sin cuenta real:

- Señal válida del Balrog y descarte de anuncios de otros eventos.
- Destino ausente, ambiguo, inválido, vencido o de variante no identificada.
- Inicio explícito, viaje, confirmación de llegada y fin del evento.
- Pausa, switch apagado, nueva invasión y ausencia de reactivación automática.
- Leveleo activo/pausado, Home manual, reset y warp pendientes.
- Cambio de cuenta/personaje/mundo, desconexión y respuestas tardías.
- Fallos de acceso/navegación e intentos acotados.
- Visibilidad del botón en juego, panel externo y standalone.
- Cacería de dorados todavía deshabilitada y contador de Golden Invasion intacto.

Diferenciá evidencia extraída del cliente, comportamiento simulado y validación pendiente en partida real.

**Entrega**

Actualizá versiones afectadas, changelog y documentación. Coordiná cambios concurrentes antes de ejecutar el release local correspondiente, con todas las validaciones del proyecto y sin editar `dist` ni `releases` manualmente.

Entregá instalables y ZIP desde `dist`, capturas de Caza y del botón durante un evento simulado, instrucciones y límites.

Estás autorizado a investigar, implementar y generar releases locales dentro del proyecto. No instales nada en el navegador habitual, no uses una cuenta real ni publiques en la web. Consultame únicamente ante un bloqueo o decisión material no resuelta por este alcance.

