# Invitaciones de party con presencia continua

Alcance aprobado por el usuario el 2026-10-14. Ejecución directa en el checkout compartido, preservando cambios previos.

- [x] Revisar AutoParty, almacenamiento v1, cliente archivado y proyección externa.
- [x] Implementar sendPartyOutside opcional (false por defecto), controles originales y espera de 2000 ms por referencia de entidad + netId/nombre/clan; cancelar al perder elegibilidad o contexto.
- [x] Mantener límites de 10 s globales y 60 s por nombre; prioridad por inicio de presencia, distancia e ID. Sin nuevos schedulers. Expulsión solo con sendParty.
- [x] Probar reloj, cancelaciones, identidad, duplicación, retorno false/void, preferencias antiguas/nuevas y Guardar/Cancelar en standalone y extensión.
- [x] Documentar Helper 1.28.0, generar release oficial helper, verificar paquete y capturas locales.

El cliente archivado asigna guild por paquete separado y lo elimina al salir; la ausencia no confirma que el jugador no tenga clan. Solo se invitan terceros con otro guild.id entero confirmado y héroe con clan confirmado. Esta limitación se documenta y no se inventa una marca de clan conocido.

Riesgos a verificar: reuso de IDs con entidad distinta, cambio de clan durante espera, expiración de cooldown con varios candidatos, pausa corta entre ciclos y cancelación del borrador sin cambiar las opciones activas.
