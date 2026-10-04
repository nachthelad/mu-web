# Catálogo revisado el 2026-10-04

Fuente: https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/common/monsters/goldenMonsters.ts

Tipos de invasión implementados por el cliente: 43, 53, 54, 78–83 y 493–502. Se conserva además 44 (Golden Dragon) del catálogo de datos y de la integración existente: 20 IDs en total.

El JSON upstream invierte los nombres 80/81; se usan los IDs explícitos de las clases GoldenLizardKing y GoldenVepar, corroborados por tablas de servidor. Golden Archer (236) es NPC; Gold Warrior (151) no pertenece a las clases de invasión. No se incluyen por coincidencia de nombre.

El escaneo no limita mapas a MAPS: esa tabla sólo da nombres, con fallback Mapa N. Conserva controles de mapa de entidad, muerte, alcance y coordenadas. La prueba del catálogo recorre diez mapas, incluido uno sin nombre, con todos los tipos; verifica detección, filtro Budge y persistencia. No demuestra qué tipos configura el servidor real para cada mapa, ni detección fuera del alcance recibido.
