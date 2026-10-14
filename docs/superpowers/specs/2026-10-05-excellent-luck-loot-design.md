# Loot de Excellent + Luck

Diseño aprobado en el chat: interruptor «Loot de Excellent + Luck» y nombres de sets/items, uno por línea. Solo recoger cuando Excellent, Luck y algún nombre coincidan. Coincidencia parcial sin distinguir mayúsculas; Dragon incluye sus piezas. Lista vacía no recoge. Estado inicial apagado y vacío. Guardar/Cancelar y persistencia en preferencias v1 existentes.

Helper mantiene el único scheduler, usa pickupTarget del cliente y suspende este loot durante Golden hunt, traslados, muerte, pausa y desconexión. Kundun permanece independiente. Un único pickup pendiente; éxito exige paquete de inventario compatible; rechazo o timeout omiten esa entidad durante un minuto. No modificar datos del item ni enviar paquetes propios.

Los filtros de Home combinan categorías y nombres con OR y no filtran Luck. Cuando se configura esta función (activa o con nombres), el ciclo debe detenerse ante filtros nativos amplios: Todo, Excellent, Ancient o nombres adicionales. Aviso accionable; no sobrescribir configuración nativa ni bloquear clicks manuales. Zen y jewels permanecen nativos. Verificar el blob nativo de 257 bytes y aceptar objetos equivalentes solo en demos. Si el blob no está disponible, no iniciar loot.

Pruebas de predicado, compatibilidad v1, rechazo/timeout/confirmación, entidades visibles y camino, prioridad de cacería, Guardar/Cancelar/rollback, persistencia y viewport. Actualizar versión y changelog; release local de Helper con validaciones completas. Sin instalación ni prueba en cuenta real.
