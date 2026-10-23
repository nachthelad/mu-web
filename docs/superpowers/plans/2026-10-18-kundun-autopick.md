# Kundun Autopick Implementation Plan

**Goal:** Recoger Kundun +1 a +5 con una opción independiente del filtro por nombre y del spot.

**Architecture:** Ampliar ExcellentLoot y el formulario canónico del Helper. El refresh existente cede el retorno al spot a una recogida Kundun pendiente; no se crea un motor nuevo.

**Tech Stack:** JavaScript userscript, node:test, Playwright y release local existente.

**Spec:** ../specs/2026-10-18-kundun-autopick-design.md

## Global Constraints

- Campo opcional `loot.kundun`, apagado por defecto; claves y contrato v1 conservados.
- Play, Home y maestro de loot activos; no operar cuenta real, no publicar en web.
- Editar src, generar dist exclusivamente mediante release, conservar cambios ajenos.

## Review Focus

- Mismo group/num con lvl 0–7/13–15 no debe activar la categoría Kundun.
- Un item cuyo texto diga Kundun no sustituye el tipo serializado.
- Fuera del spot solo se permite la categoría Kundun habilitada, dentro del rango del héroe.
- Reset, warp y clic manual cancelan o impiden recogida; no se confirma por desaparición.
- Preferencias previas sin kundun conservan su comportamiento, Guardar/Cancelar siguen transaccionales.

## Task 1: Picker e integración

- [x] Agregar tests en tests/kundun-loot.test.cjs: variantes, filtros, alcance, pausa, rechazo y confirmación.
- [x] Ejecutar `node --test tests/kundun-loot.test.cjs` y confirmar fallo antes de implementar.
- [x] Modificar src/helper/level-helper.user.js: preferencia, categoría, prioridad acotada, estados y retry limitado.
- [x] Agregar tests/kundun-loot-ui.cjs para Guardar/Cancelar, persistencia, prioridad frente al retorno al spot y pausa.
- [x] Registrar la suite en scripts/test-ui.cjs y ejecutar pruebas focalizadas.

## Task 2: Entrega local

- [x] Incrementar Helper a 1.31.0 y documentar uso y límites en README.md, docs/addon-design.md y docs/changelog.md.
- [x] Ejecutar `npm run release -- --module helper`; resolver fallos y verificar manifiestos/ZIP generados.
- [x] Entregar ubicación del instalable y aclarar validación local y partida real pendiente.

Ejecución en este chat autorizada explícitamente por el usuario: «Si dale, hacelo». No se solicita otra aprobación del mismo diseño.

Validación final: 223 pruebas de lógica y todas las suites UI/Chrome aprobadas mediante release oficial. Helper 1.31.0 / extensión 1.0.40. Hash de src/dist y checksum ZIP verificados. No se instala ni publica en web.
