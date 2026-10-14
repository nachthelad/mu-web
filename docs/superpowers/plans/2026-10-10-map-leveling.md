# Progresión por mapas y spots

Diseño aprobado por el usuario y prompt de PROMPTER recibido el 2026-10-10. Una elección por tramo/visita; nunca rotación por tiempo. Todos los destinos del catálogo M, incluido Icarus.

Arquitectura: preferencias v1 admiten `leveling:{version:1,maps:[{map,level,enabled,spots:[{x,y,enabled}]}]}`. Motor Cycle conserva comandos, Home, reset y prioridades. Selección circular por mapa y grupo de nivel, memoria de sesión conservada en pausa/muerte/Goldens, visita nueva al reset o cambio de tramo. El umbral manda incluso con enemigos. Campos antiguos permanecen recuperables e inactivos al guardar el nuevo modelo.

Migración: borrador desde ruta seleccionada; niveles distintos de un mismo mapa no se fusionan: primer tramo y aviso de revisión, original intacto. Alternativas de otro mapa al mismo umbral se trasladan como mapas empatados, elección estable. No hay escritura antes de Guardar. Edición anterior disponible expresamente en recuperación para conservar funciones y regresiones, nunca interfaz principal. Datos inválidos no se sobrescriben.

- [x] Modelo, validación, migración y selección; probar permanencia, umbrales, empates, reset, fallos y recuperación.
- [x] Selector de todos los mapas, nivel/habilitación por mapa, editor de coordenadas y captura compatible. Ayuda observada únicamente por acción explícita.
- [x] Probar standalone y Centro de control externo, transacciones/perfiles y conservar regresiones de recuperación del formato anterior.
- [x] Documentar uso final, versionar y generar release local completa y ZIP con hashes.
