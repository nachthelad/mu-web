# Alas cosméticas y Visualización

## Catálogo auditado para Helper 1.17.0

Consulta pública sin cuenta del 2026-10-07: página actual `assets/index-CsqvKXwo.js`, boot `boot-BQtSGwQw.js` y catálogo/renderer `layout-BkT3HDXh.js`. Capturas completas en `artifacts/interface-research/wings-*-current.*`; extracción del slot 7 en `wings-deployed-catalog.json` y fixture estable `tests/fixtures/wing-catalog.json`. El renderer `setWingsAsync` exige tanto definición de item como `wingSpec`: se contrastaron ambos. Incluye 16 estilos reconocidos más Originales.

| Grupo / número | Nombre del juego (selector) | Modelo Item/ |
| --- | --- | --- |
| 12/0 | Wings of Fairy | Wing01.glb |
| 12/1 | Wings of Angel | Wing02.glb |
| 12/2 | Wings of Satan | Wing03.glb |
| 12/3 | Wings of Spirit | Wing04.glb |
| 12/4 | Wings of Soul | Wing05.glb |
| 12/5 | Wings of Dragon (Blade Knight) | Wing06.glb |
| 12/6 | Wings of Darkness | Wing07.glb |
| 12/36 | Wing of Storm | wing08.glb |
| 12/37 | Wing of Space Time | wing09.glb |
| 12/38 | Wing of Illusion | wing10.glb |
| 12/39 | Wings of Hurricane | wing11.glb |
| 12/40 | Mantle of Monarch | DarkLordRobe02.glb |
| 12/41 | Wing of Mistery | Wing42.glb |
| 12/42 | Wing of Despair | Wing43.glb |
| 12/43 | Wings of Violent Wind | Wing44.glb |
| 13/30 | Cape of Lord | DarkLordRobe.glb |

Upstream auditado `41147b8171fae04825eb6ad59b0b6a973cf928f3` agrega 12/49 Cape of Fighter y 12/50 Cape of Overrule; ambas faltan del catálogo y wingSpec desplegados, por lo que no se ofrecen. Recursos extra de tienda o alas de armas no prueban pertenencia al slot: no se inventan IDs. Nombres de constantes como Eternal/Ruin/Curse/Dimension difieren de los nombres del catálogo; el selector usa estos últimos.

Los niveles/brillos, Excellent, Ancient y sockets son variantes dinámicas del renderer, no modelos extra. Se conservan todas las propiedades del item recibido y se reemplazan únicamente group/num de la copia visual. No se fuerza nivel ni se cambian las opciones gráficas globales.

`wingStyle` es opcional y validado en `mu.level-helper.settings.v1` (demo `mu.level-helper.demo-settings.v1`), con Originales como valor anterior por defecto; mismo proveedor Guardar/Cancelar/rollback, sin migración ni cambios de HUB/Config. Se restaura al recargar. Casco continúa por sesión. Los cambios directos entre estilos descargan el modelo anterior y marcan `charAppearance.changed`, cancelando cargas obsoletas.

Límite: HEAD a rutas directas Data/Item devolvió HTML fallback, no modelos; no acredita disponibilidad efectiva. El árbol upstream contiene los BMD asociados, pero falta comprobar carga de recursos, encaje y animación con renderer real. El catálogo describe el despliegue auditado, no garantiza todas las opciones del servidor ni futuras versiones. Las demos solo verifican selección, IDs entregados al renderer y persistencia; no confirman partida real.

Inspección 2026-10-07, sin cuenta. La captura pública local `artifacts/interface-research/boot-Cdj0FSwZ.js` confirma que AppearanceSystem llama `model.setWingsAsync(appearance.wings)` y AnimationSystem anima `model.Wings` por separado.

Fuentes upstream descargadas en artifacts/interface-research:

- [playerObject.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/common/playerObject.ts): setWingsAsync prepara WingObject, resuelve ItemsDatabase y llama loadPartAsync con lvl/isExcellent/itemVisualTier. loadPartAsync usa loadSeq para descartar cargas invalidadas.
- [wings.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/common/wings.ts): grupo 12 y WINGS_OF_DRAGON = 5, enlace al hueso dorsal 47.
- [appearanceSystem.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/ecs/systems/appearanceSystem.ts): reconstrucción de las piezas de la apariencia.

Se intercepta el método solo en la instancia del modelo propio. Recibe una copia visual del item; sin alas equipadas se conserva null. No hay cambios en solicitudes, inventario, vuelo, daño, defensa ni presentación recibida por otros jugadores. El nivel/brillo visual se deriva del item original, no se inventan upgrades.

Pruebas: `tests/wing-style.test.cjs` verifica aislamiento, equipo actualizado, ausencia de alas, cargas pendientes, cambio de mundo/modelo, suspensión, coexistencia con casco y errores sin promesas rechazadas. `tests/visualization-ui.cjs` simula el renderer y prueba Guardar/Cancelar/rollback, recarga, anidado del host de Radar y viewport compacto. `tests/config-ui.cjs` verifica órdenes de carga.

Capturas: `docs/screenshots/visualization-wings-preview.png` y `visualization-wings-compact-preview.png`. Son interfaz/demo; no muestran el modelo de alas real. Falta confirmar apariencia, animación y encaje en partida real. No se instaló ni publicó en el navegador.
