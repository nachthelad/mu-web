# Reset opcional y cuatro pestañas

Cambio solicitado y autorizado: en Leveleo agregar el switch «Reset automático al nivel 400». Persistir autoReset booleano opcional en preferencias v1; valor ausente equivale a true para conservar el comportamiento anterior. Apagado, el ciclo continúa en el último spot al nivel 400 y superiores sin enviar /reset. Encendido conserva reset/reingreso/confirmación existentes. Guardar no inicia un ciclo detenido. Desactivar cancela un reset en cola aún no enviado; un reset ya enviado sigue esperando su respuesta del servidor.

Helper presenta Leveleo, Obtener, Party y Visualización como cuatro pestañas iguales, en dos columnas para el ancho de 360 px. Flechas recorren las cuatro con wrap; Home/End van a primera/última. Cada panel conserva los borradores al cambiar de pestaña/minimizar y participa en Guardar/Cancelar/rollback.

Visualización ofrece «Ocultar casco» como checkbox ordinario: marcado oculta, sin marcar muestra. Conserva el motor de HideHelmet y su carácter por sesión, apagado tras recargar. Party conserva sus dos switches y motores.

Editar únicamente Helper, incrementar a 1.14.0, actualizar documentación/pruebas y generar instalable mediante release con todas las validaciones. Probar migración/reset desactivado/activación tardía/cancelación de cola, persistencia, borradores, teclado, checkbox del casco, viewport y capturas. No instalar en cuenta real ni publicar online.
