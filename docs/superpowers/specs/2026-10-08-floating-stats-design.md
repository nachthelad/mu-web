# Estadísticas flotantes

Pedido confirmado: sacar el panel del HUB y mostrarlo como ventana independiente, al estilo del minimapa. Reutilizar el panel existente y su motor; controles mostrar/ocultar en el HUB o la barra standalone, candado y arrastre por cabecera. Posición/candado guardados en clave propia (demo aislada), límites por viewport y soporte de teclado. Ocultar y minimizar HUB no borran A/B ni desactivan la preferencia. Desactivar Config sigue limpiando capturas.

Helper 1.19.1 ofrece el host original de su botón mediante capabilities.actions; HUB 1.4.6 monta también estas capacidades en módulos legacy, sin motores adicionales. Ventana en document.body con Shadow DOM propio, cálculo/lecturas conservados en refresh del Helper. Release conjunto local y validación completa sin cuenta real.
