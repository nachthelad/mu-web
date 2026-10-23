# Programación diaria · Helper 1.30.0

En Configuración → Leveleo → Programación, elegí inicio y fin y pulsá **Guardar programación**. El switch está apagado por defecto, con 02:00–06:00 como ejemplo inicial. Guardar habilitada dentro de horario puede iniciar inmediatamente. Ese botón guarda únicamente la programación; Guardar/Cancelar del formulario general conserva lo ya guardado con él.

Las horas son de **Argentina**, zona IANA `America/Argentina/Buenos_Aires`, aunque Windows tenga otra zona. Inicio incluido, fin excluido: 02:00–06:00 permite iniciar desde las 02:00 y pausa desde las 06:00. Se aceptan cruces de medianoche, como 22:00–03:00. Horas inválidas o iguales se rechazan. Se evalúa en el refresh existente de 500 ms, sin otro motor ni temporizador.

## Play y pausa

- Desactivada: los controles manuales conservan su función.
- Activada: fuera de horario no permite iniciar leveleo. Dentro intenta iniciar cuando hay cuenta, personaje y configuración disponibles, sin tomar Home manual ni interrumpir Caza.
- F10, Play del juego, HUB y panel externo usan la misma acción. Pausa manual bloquea el resto de esa ocurrencia, incluso tras recargar; otro Play dentro del horario levanta el bloqueo y pasa a control manual.
- Editar horas conserva la pausa hasta el fin más tardío entre la ocurrencia anterior y la nueva activa. Deshabilitar y rehabilitar no elimina la pausa. Un fallo tampoco se borra editando la franja activa.
- Un fallo o inicio rechazado queda bloqueado hasta Play explícito o la siguiente ocurrencia. No reintenta en cada refresh. Si faltan personaje listo, confirmaciones o disponibilidad de Home/Caza, espera sin consumir el intento.
- Desactivar detiene el ciclo bajo control programado. Un ciclo iniciado explícitamente con Play sigue en modo manual. Mientras la programación esté habilitada, el fin del horario detiene ambos.
- Caza/Balrog es independiente. Puede tomar el control y deja inhibido el leveleo durante el resto de la ocurrencia. El cierre de horario del leveleo no detiene Caza, Radar, Analytics ni la extensión.

## Sesión, almacenamiento y límites

Preferencias: campo opcional `schedule: {version:1, enabled, start, end}` en el perfil existente por mundo/cuenta. La ausencia equivale a deshabilitado. Se conserva contrato v1 y todas las claves anteriores.

Registro operativo: `mu.level-helper.schedule-runtime.v1.account.<identidad codificada>`, separado de preferencias. En demos: `mu.level-helper.demo-schedule-runtime.v1.account.<identidad codificada>`. Guarda ocurrencia y fin, pausa/fallo con caducidad, intento, personaje y una concesión de control de tres segundos renovada por el refresh. Web Locks serializa las decisiones entre pestañas. Otra pestaña no inicia mientras esa concesión esté vigente. Un registro inválido o fallo de almacenamiento bloquea el inicio automático y se informa; no se sobrescriben datos inválidos. Si falla persistir una pausa, su conservación después de cerrar la pestaña no puede garantizarse: se muestra el error y se mantiene bloqueada esa pestaña.

Recargar dentro de franja permite recuperar una ejecución programada con el mismo personaje y sin pausa/fallo vigente, una vez vencido el control de la pestaña anterior. Un personaje diferente requiere Play. Cambiar de cuenta o perder identidad autenticada cancela la intención anterior; si había ciclo activo, registra el motivo para evitar reiniciarlo al reconectar durante esa ocurrencia. No agrega login automático. El reset/reingreso usa el mecanismo actual mientras la identidad siga siendo válida.

Al llegar al fin se cancela la cola aún no enviada y el reingreso futuro, se limpian movimientos/buffs propios y se solicita detener Home solo si estaba bajo control del leveleo. Una solicitud de reset/warp ya enviada no puede retirarse; se informa pendiente de confirmación y no se repite. Home manual queda libre después de confirmar la pausa.

Al volver de suspensión se evalúa la hora actual: no reproduce franjas vencidas. Chrome puede retrasar, congelar o descartar la pestaña; no hay ejecución garantizada con equipo dormido, navegador cerrado o pestaña congelada. El worker no ejecuta leveleo.

## Evidencia local

`tests/schedule.test.cjs` cubre límites exactos, zona del sistema distinta, medianoche/año nuevo, validación, pausas/fallos y concesiones. `tests/schedule-ui.cjs` usa reloj controlado y perfiles de demo para comprobar acciones reales del Helper, persistencia, edición, cuentas/pestañas, almacenamiento fallido, no reinicio tras fallo de Home, cancelación de reingreso/viaje al fin y Caza independiente. La suite del panel externo verifica los mismos controles originales y su guardado explícito. Las suites forman parte del release obligatorio. Capturas: `docs/screenshots/schedule-config.png`, `schedule-config-mobile.png` y `schedule-external.png`.

Las pruebas usan simulaciones aisladas, sin cuenta real. No confirman el funcionamiento en partida real.
