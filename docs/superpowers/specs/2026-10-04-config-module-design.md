# Config independiente y HUB extensible

Diseño aprobado en este chat. Config será el cuarto userscript y tendrá ventana flotante con Guardar/Cancelar. Helper ofrece spots X/Y para Lorencia, Arena e Icarus, envío y aceptación de party y mostrar casco. Radar ofrece Trackear dorados (solo puntos históricos) y exportación.

Cada módulo conserva motor y almacenamiento. El registro v1 incorpora capacidades opcionales de vista, acciones y settings; HUB y Config descubren módulos sin listas cerradas. Los hosts se montan, no se clonan. Config valida todos los proveedores antes de aplicar y revierte los ya aplicados si falla otro. Sin Config se conservan ajustes independientes.

Spots iniciales 47/59, 12/39 y 43/155; enteros 0–255. Guardar no inicia el ciclo. Al modificar el destino activo se cancela el movimiento anterior y recalcula; Golden hunt toma el cambio al devolver el control. Party tiene dos toggles inicialmente activos; desactivar envío suspende expulsiones. Casco es por sesión. Solo spots y party se persisten en una nueva clave versionada, separada para demos.

Release inicial conjunto, cuatro instalables y rollback compatible con conjuntos anteriores de tres módulos. Sin instalación ni publicación web. Pruebas en demos sin cuenta real.
