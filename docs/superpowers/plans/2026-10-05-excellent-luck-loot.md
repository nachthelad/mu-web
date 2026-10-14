# Excellent + Luck Implementation Plan

**Goal:** Implementar el filtro de loot aprobado en el chat.

**Architecture:** Predicado puro y controlador de pickup en Helper. Config mueve el proveedor existente; HUB y Radar conservan sus motores y contrato v1.

**Tech Stack:** Userscript JavaScript, node:test y Playwright.

**Spec:** ../specs/2026-10-05-excellent-luck-loot-design.md

## Restricciones

- Fuentes en src, instalables generados en dist; preferencias opcionales v1.
- Excellent y Luck provienen de droppedItem.item, nunca del texto.
- No sobrescribir filtros de Home; detener el ciclo si permiten loot adicional.
- Demos sin cuenta real. Release solo local.

## Riesgos a verificar

- Filtros nativos amplios: bloquear antes de iniciar Home.
- Item normal con nombre coincidente: rechazar.
- Lista vacía o interruptor apagado: no seleccionar pickups propios.
- Rechazo o desaparición del drop: no contar como éxito ni repetir en bucle.
- Cancelar o rollback de Config: conservar ajustes previos sin iniciar ciclo.

## Pasos

- [x] Agregar preferencias opcionales excellentLoot y excellentNames; validar tipos y límites (50 nombres de 80 caracteres).
- [x] Agregar normalización, predicado y decodificación de filtros/rango nativos; probar flags de Excellent y Luck reales y bits de blob.
- [x] Agregar ExcellentLoot con un pending, cancelación de movimiento propio, timeout de 15 s y espera de 60 s tras rechazo; integrar en refresh y eventos de inventario.
- [x] Agregar switch y textarea al proveedor existente; verificar Guardar, Cancelar, rollback y recarga.
- [x] Verificar integración en demo con drops válidos/invalidos y Native Home incompatible, pausa, cacería y viewport; guardar captura.
- [x] Documentar uso y límites, incrementar Helper a 1.12.0 y ejecutar npm run release -- --module helper.

Validación completada: 86 pruebas de lógica y ocho suites UI. Manifest helper 1.12.0; SHA-256 src/dist/manifest coincidentes. Release local; sin instalación ni cuenta real.

