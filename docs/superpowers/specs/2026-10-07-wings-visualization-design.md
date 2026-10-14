# Alas y Visualización

Diseño aprobado por el usuario: Visualización contiene Trackeo (dorados, White Wizard Corps y Red Dragon) y Estilos (casco y selector de alas Originales / Blade Knight).

Helper intercepta setWingsAsync solamente en el modelo propio, pasando una copia cosmética group 12 / num 5 (Wings of Dragon). No modifica inventario, apariencia compartida ni solicitudes al servidor. Sin alas equipadas no agrega alas. La preferencia dura la sesión, como ocultar casco. Se restaura el método y se solicita reconstrucción de apariencia al apagar, cambiar de personaje/modelo, cargar o entrar en transformación/Chaos Castle. Fallas restauran el adaptador y muestran un aviso sin detener el motor.

Radar conserva su proveedor transaccional y almacenamiento. Config admite slots opcionales de presentación: mueve el host original del proveedor a un slot ofrecido por otro proveedor. Con módulos antiguos o ausentes, conserva la presentación por secciones. Guardar/Cancelar y rollback operan sobre todos los proveedores aunque estén anidados.

Validación: pruebas del adaptador (aislamiento, equipo actualizado, ausencia de alas, cargas pendientes, fallas y suspensión), UI integrada en ambos órdenes de carga, cancelación/rollback/persistencia de trackeo y viewport compacto. Release local conjunta; sin instalación ni prueba en cuenta real.
