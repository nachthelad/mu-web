# Compatibilidad del cliente sin globals (2026-10-21)

Pedido autorizado: corregir el addon y generar la actualización local.

## Alcance

Corregir la extensión Chrome y su panel externo. El cliente index-URnTVW_1.js / boot-BDhMntYx.js dejó de exponer los globals usados por los motores. layout-DQbdTT-G.js todavía exporta el singleton de estado como n, social como V y el bus como aw. El mundo vigente está en estado.world.

Se elige un inicializador de compatibilidad dentro de page-bridge.js: importa únicamente ese módulo del mismo origen cuando el documento declara la entrada auditada. El navegador reutiliza el módulo del cliente; no se importa boot ni se crea otra escena, socket, motor o intervalo. Publica getters para los cuatro nombres anteriores, conservando las referencias originales y siguiendo estado.world cuando cambia. Los clientes que ya tienen los globals conservan su ruta actual. Los userscripts standalone no incorporan este inicializador.

Alternativas descartadas: reescribir los accesos de todos los motores amplía innecesariamente la corrección; detectar propiedades o exports arbitrarios vuelve insegura la compatibilidad con builds desconocidos.

## Fallos y conservación

Build desconocido, exports incompletos o fallo de importación: no publicar referencias parciales y mostrar un diagnóstico claro en el panel. Mantener la identidad y lease existentes, el bloqueo de Play, las claves y preferencias por cuenta. No instalar ni probar automatizaciones en una cuenta real. No añadir detección evasiva ni modificar controles del cliente.

## Validación y entrega

Chromium aislado con módulo nativo simulado sin globals: identidad, panel, configuración, cambio de mundo, singleton compartido, carga tardía y errores. Conservar pruebas de la ruta legacy, duplicados y leases. Ejecutar release oficial con todas sus suites y verificar ZIP, hashes y manifiestos. La extensión aumenta su versión automáticamente; los módulos sin cambios conservan @version. La simulación no acredita aceptación del servidor.
