# Golden counter implementation plan

Goal: mostrar el total nativo de Golden Invasion en un overlay independiente, movible y bloqueable.

Architecture: Radar conserva el único scheduler y la lectura existente de InvasionMonsters/HUD. El nuevo host queda en body, fuera de HUB y del ocultamiento del panel externo. No altera Golden hunt.

- Agregar overlay con total, tooltip de mapas y posición/candado propios en almacenamiento separado para demo.
- Distinguir ausencia de total, cero, datos vencidos y fin. Invalidar al cambiar identidad o desconectar.
- Probar carga tardía, cambios, expiración, arrastre, persistencia y extensión; guardar captura.
- Documentar límites, incrementar Radar y ejecutar release local con validaciones completas.
