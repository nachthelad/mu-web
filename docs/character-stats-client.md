## Cliente del 22/10/2026 · Aida y Dark Lord

Helper 1.31.3 incorpora el par index-D-gOSya0 / layout-DCITLqBq. Propiedades Gg=nF, tooltip MNt=nH, nombre mk=fd y cálculo Uxt=b1; no reutiliza nC/nE del build anterior. Fixtures con fórmulas, catálogo, propiedades, tooltip y cierres nativos jt/F0 verifican estadísticas y C/V. [Evidencia y límites](client-oct22.md).

# Segundo build del 21/10 · Helper 1.31.2

Tras entregar 1.0.43, la raíz pública pasó a index-Do3IjarP.js / layout-CoOAKkh-.js. El texto exacto «Cliente no compatible. Hace falta actualizar el addon.» corresponde al rechazo por entrada desconocida del puente, anterior a resolver identidad. No demuestra un fallo de la cuenta ni requiere iniciar Play. Se añadieron ese par auditado al puente y al lector, conservando los anteriores y todas las validaciones.

El layout nuevo conserva f=n (store), q=V (social), x=aw (eventBus), world dentro del store; boot-D9EQMRR7 importa n como E y b1 como sR para Character Info. Estadísticas mantiene QCt=b1, No=bU, se=aL, zg=nC, I5t=nE, ek=fd. Cierres jt/G0 ahora en index-BzlLuH3h. La extracción exacta confirma que fórmula, propiedades/tooltip/nombres, MobX y cierres no cambiaron; el catálogo sí cambia requisitos (por ejemplo Dragon Knight Helm ReqLvl 380→0). Se usa el catálogo nuevo, sin reciclar su copia anterior.

Evidencia en artifacts/client-recheck y audit.json; extracción reproducible con node scripts/character-oct21-fixture.cjs --recheck. client-recheck.test.cjs verifica hashes, exports, llamada de Character Info y diferencias del catálogo. Las suites extension-client-ui y character-oct21-ui aceptan --recheck y se ejecutan obligatoriamente para ambos builds. Pruebas aisladas sin cuenta real; instalación en el navegador habitual y comportamiento real pendientes.

Entrega completada: extensión 1.0.44 / Helper 1.31.2, conjunto 2026-10-21T22-14-56-309Z-24c91c. Sintaxis, 230 pruebas de lógica y todas las suites UI obligatorias aprobadas. El release completo se ejecutó con acceso permitido a localhost; no se omitieron validaciones. Ver release.log y verification.json en artifacts/client-recheck. Verificación oficial del manifiesto, igualdad de fuentes/dist/paquete y ZIP reproducible con checksum aprobadas. La raíz final sigue usando index-Do3IjarP y layout-CoOAKkh- conserva SHA-256 69c278b3537de11c9870f85271822944cccf56c1d6de06e1501e1443461aea48. El usuario debe reemplazar los archivos del paquete instalado y recargar extensión y juego; no se instala automáticamente.

# Estadísticas y C/V · Helper 1.31.1 (2026-10-21)

La raíz pública revalidada carga index-URnTVW_1.js. El adaptador faltante impedía cálculo y coexistencia C/V. layout-DQbdTT-G.js exporta QCt=b1 (Character Info), No=bU (catálogo), se=aL (slots), zg=nC (propiedades), I5t=nE (tooltip) y ek=fd (nombre). boot-BDhMntYx importa b1 como sR y lo llama con los atributos/equipo de playerData. No se aceptan aliases parecidos de builds anteriores: np/n8/mx ya representan otras interfaces. Se preservan los tres adaptadores anteriores.

La noticia pública /api/news del 21/10 a las 19:47:27 UTC (16:47 Argentina) anuncia corrección del staff principal y advertencia de mano secundaria. El código lo confirma: K4e consulta se.LeftHandSlot=0, añade aC(staff) al rango base y expone P4e(staff) en staffRate separado. GJe muestra el porcentaje del tooltip zg y FJe añade item.offHandStaff a staffs de ancho 1 compatibles con Knight/MG/RageFighter; Staff of Kundun (5/11) queda excluido de ese aviso. Esa condición del aviso no es la regla completa del inventario: dt en index-deEbYU8n permite slots [0,1] para items cuyo ItemSlot es 0 y Ls verifica clase/requisitos mediante las propiedades del catálogo. El fixture admite poblar ambas manos para comparar el cálculo, pero no confirma aceptación del servidor de toda combinación. No se multiplica el rango por staffRate, no se suma Additional ni Excellent al agregado.

| Fixture Soul Master, nivel 10, atributos 65535 | Mágico nativo | Staff leído por C |
| --- | --- | --- |
| Sin staff | 7281–16383 | 0 |
| Kundun Excellent +13 principal (slot 0) | 7384–16493 | 110 |
| Mismo staff solo en slot 1, datos de prueba | 7281–16383 | 0 |
| Ambos slots poblados, datos de prueba | 7384–16493 | 110, solo principal |

La captura del usuario muestra físico 8294–16493 y mágico 7384–16493 (+110), reproducidos con el catálogo de fallback extraído; no son expectativas universales. Los buffs, catálogo recibido en una sesión real y daño efectivo contra enemigos siguen fuera de esta prueba. El tooltip informa Additional Wizardry 16 y Excellent rate 10 para las opciones del fixture; no son otra suma al rango. Slots undefined o fuera del catálogo conservan null en las métricas que dependen de ellos, sin invalidar métricas independientes. Dos staffs no generan un porcentaje único de tooltip.

La exclusividad sigue en el auxiliar index-deEbYU8n.js: jt/G0 instala reacciones MobX que cierran el resto de ventanas. El hook existente sigue siendo compatible y solo veta el cierre del hermano C/V en la apertura. OFF conserva las ventanas abiertas y restaura exclusividad para próximas aperturas; controles, arrastre, escalas y persistencia son nativos. No se importan boot ni esos auxiliares en producción.

«Pausado: cambió la cuenta» no era un error de la calculadora: syncAccount también lo emitía para null→primera cuenta cuando el puente terminaba de cargar. Ahora esa transición dice «Pausado: cuenta conectada; inicio manual». Un cambio posterior mantiene su mensaje, limpieza e inhibición; el diagnóstico no habilita Play ni debilita accountIdentity. La comparación valida la cuenta nuevamente antes de leer datos. El puente n/V/aw y el getter world quedan sin cambios.

Evidencia: artifacts/stats-2026-10-21/{root.html,index.js,layout.js,boot.js,index-deEbYU8n.js,news.json,audit.json}. scripts/character-oct21-fixture.cjs extrae fórmula, enums, catálogo, propiedades, nombres, tooltip, MobX y registro de cierres sin modificar sus cuerpos. Traducciones, nombres de skills, configuración Ancient y stores auxiliares de ventanas son scaffolding explícito; no se ejecuta el boot nativo. Tests character-oct21.test.cjs verifican hashes, referencias y combinaciones. character-oct21-ui.cjs usa puente y Helper originales juntos con import compartido tardío, errores de exports, build desconocido, cierres reales, C→V/V→C, Escape/inputs simulados, ON/OFF, equipo/A/B, recreación, cambios de cuenta/mundo y Play pausado. El teclado del fixture es scaffolding; las suites existentes cubren posiciones en ambos skins, recarga, Cancelar/rollback y panel externo. Captura local: docs/screenshots/character-oct21-cv.png. Esto separa auditoría estática, reproducción aislada y partida real pendiente.

Release local completado: Helper 1.31.1, extensión 1.0.43, conjunto 2026-10-21T22-03-29-389Z-ac6fe5. Sintaxis, 228 pruebas de lógica y todas las suites UI obligatorias aprobadas. La primera ejecución se detuvo en server.test con fetch failed por localhost restringido; la ejecución completa con acceso permitido pasó, sin omitir pruebas. Logs release.log y release-permitted.log en artifacts/stats-2026-10-21. Fuente/dist/paquete idénticos; ZIP reproducido y SHA-256 27e002f351a64bb213ac86ca5b05f3ea686af584484349b24fc14319ce860f98. Puente preservado byte a byte, SHA-256 6f1aa8ffc89c6f64fd440bd794a64a1aeccd0da35d0e768ab9949622b377f507. Sin instalación ni publicación externa.

# Historial: estadísticas y configuración inmediata · Helper 1.29.3 (2026-10-14)

Desde 1.29.3 el addon no escribe estilos ni posiciones sobre C/V. Se retira el anclaje a las esquinas superiores que hacía mountStats en cada refresh, incluso con estadísticas apagadas. El arrastre, bloqueo, escala y persistencia quedan a cargo del cliente nativo. El detalle permanece adjunto a C y solo acomoda su propio host alrededor de la posición medida, sin mover C ni inventario.

La demo modela arrastre/persistencia con claves mu.native-window.demo.* separadas; la suite character-position-ui verifica ambos skins durante refresh, cambio de equipo, A/B, ON/OFF, recreación y recarga. Es scaffolding de ventanas nativas, no un gestor nuevo instalado en el juego.

Release local 1.29.3: 204 pruebas de lógica y todas las suites UI aprobadas, incluida la nueva prueba de posiciones. Log en artifacts/stats-research/free-windows-release.log. El usuario confirmó la corrección previa de convivencia C/V; la versión con posiciones libres queda pendiente de confirmar en su partida. Sin instalación automática.

Corrección 1.29.2: la auditoría inicial omitió index-D5yEXyzD.js. Ese módulo declara el registro jt y X0, que instala reacciones MobX para cerrar otras ventanas al abrir una. Se retiró el bypass nativePair de 1.29.0/1.29.1: todos los builds auditados vuelven a instalar pairCharacterInventory con pairInventory ON. OFF restaura la exclusividad nativa en próximas aperturas, sin cerrar forzosamente las ventanas abiertas.

scripts/character-cv-fixture.cjs extrae el MobX vigente y el registro/installer exactos. Auxiliary stores para otras ventanas son scaffolding explícito. Evidencia pública y hashes en artifacts/stats-research/cv-audit.json. La prueba reproduce primero C→V y V→C exclusivos; después verifica coexistencia con hook, cierres explícitos, skill list/party y restauración al disponerlo. La prueba browser de import ahora instala esas reacciones antes del Helper; ya no presupone ambos booleans encendidos sin cierres nativos.

Release local 1.29.2: 204 pruebas de lógica y todas las suites UI aprobadas; log en artifacts/stats-research/cv-fix-release.log. Prueba adicional cv-item-swap-ui.cjs: C/V visibles durante cambio simulado de staff y captura A/B con delta nativo. Se leyó únicamente el DOM del juego del usuario para confirmar entrada index-C399rQbj y switch ON; no se cambiaron controles ni se instaló código en su partida. Funcionamiento real de la versión corregida pendiente.

Desde 1.29.1, el switch Estadísticas detalladas es el único control de visibilidad. Activado, el detalle aparece al abrir C manualmente o al activar con C abierta; también después de recargar/recrear C. No hay gráfico, botón Detalle en C ni minimizar el detalle. Apagar oculta y limpia A/B. No abre C ni inventario ni inicia Play.

Estado vigente: C muestra métricas actuales y A/B, sin filas ni nombres de equipo. Los snapshots internos conservan las piezas para informar cambios de condiciones. Ambos switches de Estadísticas se guardan inmediatamente por mundo/cuenta, sin Play ni Guardar; Cancelar conserva esos valores. Fallos de guardado restauran el control y muestran No guardado. Ayuda en «?» con hover, foco, Enter y toque.

El Centro de control abre el proveedor original al elegir la sección; Estadísticas no muestra Guardar/Cancelar ni exige Abrir configuración. Escape descarta otros borradores pendientes mediante Config y vuelve a dejar estos controles disponibles. Otras secciones conservan sus transacciones.

Auditoría pública del 14/10: la raíz carga index-C399rQbj.js. El adaptador anterior no lo aceptaba. layout-68bM4dWi.js exporta FPt como b1 (cálculo utilizado por B8 en boot-zb5ID4N-.js), Co como bU (catálogo), se como aL y _g como np (propiedades calculadas). Se verifica el catálogo y los índices de slots antes de aceptar el módulo; builds desconocidos degradan sin inventar valores.

El cliente conserva booleans de C/V y ventanas con cierres propios, placement, z-index y closeTop por orden. Eso no implica convivencia: index-D5yEXyzD.js instala además la exclusividad mutua. El hook solo veta el cierre del hermano durante una apertura C/V; no reemplaza teclado, Escape ni botones ni evita cierres por terceros menús.

Evidencia: artifacts/stats-research/rework-2026-10-14.html, rework-{index,layout,boot,window}.js y rework-audit.json con hashes. scripts/character-rework-fixture.cjs genera fórmulas y catálogo exactos sin iniciar el cliente. La prueba de import usa un módulo de fixture con cálculo exacto y tooltip nulo explícito; no verifica el tooltip del servidor. Pruebas anteriores mantienen cobertura de tooltip auditado. Las demos y screenshots son evidencia local, no partida real.

## Historial: equipo completo y convivencia C/V · Helper 1.26.0 (2026-10-12)

Config → Estadísticas → **Permitir C e inventario juntos**. Switch por mundo/cuenta, apagado si no había preferencia, guardado inmediato e independiente de Estadísticas detalladas y Play. Cancelar conserva el switch guardado. No abre ventanas. Apagarlo no cierra las que ya están abiertas: restaura la exclusividad para próximas aperturas. Sin adaptador compatible conserva controles nativos.

El detalle muestra los 12 slots equipados: ambas manos (arma/escudo según el objeto real), casco, armadura, pantalones, guantes, botas, alas, mascota, pendant y ambos anillos. Cada fila desplegable conserva su apertura durante los refresh y muestra el tooltip del cliente, más propiedades recibidas. Mochila y modelos cosméticos quedan fuera. Vacío, datos pendientes e item sin resolver son estados distintos; un item desconocido no invalida otras piezas ni métricas independientes.

A/B conserva equipo y tooltip por slot, identifica las piezas cambiadas y muestra propiedades capturadas A/B en esas filas. Las estadísticas agregadas nativas y los bonus de objetos son fuentes separadas: no se suman porcentajes ni se estima daño contra enemigo. Ausencia de propiedades no demuestra cero.

## Diagnóstico demostrado y auditoría pública

La raíz pública ahora carga index-CiMTJPU8.js. El lector anterior aceptaba exclusivamente index-DnTsp0bZ.js: no intentaba importar el adaptador en el build nuevo. C/V estaba condicionado a la compatibilidad del mismo adaptador, por lo que también quedaba sin hook. Esto explica la regresión del código frente al build público; falta confirmar la instancia instalada del usuario en partida real.

Exports auditados de layout-BSIMx9t6.js: b1=W_t (Character Info), bU=_o (catálogo), aL=se (slots 0–11), n6=yg (propiedades calculadas de item), n8=sPt (tooltip), mx=Xoe (nombre). El boot actual usa b1 como GO al construir Character Info. Se conserva además el adaptador del build anterior; builds desconocidos no se aceptan por semejanza de nombres.

index-CaERyos2.js mantiene St/zl: reacciones MobX cierran otras ventanas al abrir una. La excepción sigue limitada al cierre mutuo durante la apertura C/inventario; cierres explícitos, Escape y terceros menús continúan nativos. No se reemplazan los atajos configurables. Layout mantiene skins .character-info y .v097d-character y equivalentes de inventario.

Opciones se leen mediante el tooltip actual, sin reinterpretar sus flags. El cliente incluso aplica su rama defensiva al pendant 13/12 por el solapamiento de sus predicados; el lector conserva lo que informa el cliente, sin convertirlo en una afirmación sobre el efecto del servidor. Sets/buffs y daño efectivo siguen sin confirmación.

Evidencia pública guardada en artifacts/stats-research/current-*.js y current-2026-10-12.html. Hashes en current-audit.json. scripts/character-current-fixture.cjs extrae fórmulas, catálogo, tooltip y MobX sin iniciar el juego; traducciones, nombres de skill y configuración Ancient del fixture son scaffolding explícito. Las pruebas verifican ramas reales del tooltip con claves de traducción, no los textos traducidos ni efectos del servidor.

Validación: pruebas de equipo completo, anillos distintos, arma/escudo, catálogo parcial, slots vacíos/pendientes, A/B, C/V con MobX actual y loop nativo, switch independiente, Cancelar, recarga, apagado y viewport compacto. Panel externo proyecta el input original y su estado de guardado. Captura character-equipment-c-v-preview.png. Demos sin cuenta; partida real pendiente.

---

# Character Info integrado · Helper 1.20.1

Esta sección sustituye la presentación flotante 1.19.1. HUB permanece 1.4.6; Config 1.3.0. Config → Estadísticas → habilitar → Guardar; luego activar el gráfico y abrir C manualmente. El gráfico no abre C. El toggle empieza apagado en cada carga; la preferencia por mundo/cuenta conserva Guardar/Cancelar. Cierra C con sus controles o Escape; ocultar C conserva A/B en la sesión. Desactivar, carga, desconexión o cambio de identidad limpia capturas. Play no interviene.

El host original de Helper se monta como extensión lateral de .mu-item-window.character-info; en viewport menor a 850 px pasa debajo. No reemplaza ni clona contenido nativo ni puntos. Con detalle o C+V se aplica una distribución temporal de ambos paneles, ajustando escala y scroll; se restaura la presentación anterior al cerrar. No modifica mu-windows ni elimina paneles nativos. El refresh existente monta otra vez el mismo host tras recreación. La posición/candado antiguos quedan conservados sin uso ni migración.

## Evidencia revalidada el 2026-10-08

Consulta pública sin cuenta: la raíz sigue usando index-DnTsp0bZ.js; boot-BiqAhQ9L.js y layout-DyxNG9m6.js coinciden byte a byte con los archivos auditados. Layout SHA256 d72dc219facdaf835443e76c28fb385ee8d4d3f3d52844d71e76d934ccdef325. Evidencia nueva live-index.html, live-entry.js (SHA256 c19e11a0381d7608813970b1062e9575bdb7f5860878588d8b839bdb90ac95fe), live-boot.js, live-layout.js, index-MYtcMCbX.js y windowState-DhxNumhX.js en artifacts/stats-research.

Inventario: función Ce permite [LeftHandSlot, RightHandSlot] para items de slot 0; Yo elige primero el libre. Constantes verificadas LeftHandSlot=0 y RightHandSlot=1. Ambos staffs del catálogo tienen ItemSlot=0. Esto identifica el slot primario del cliente, no el slot observado en una cuenta real ni la mano nombrada por el usuario.

Exclusividad: ei en index-MYtcMCbX.js instala reacciones MobX que cierran las demás ventanas al abrir una. Helper intercepta solamente el cierre del hermano durante la transacción de apertura C/inventario. Consume la excepción en el primer cierre mutuo (o la libera al concluir el microtask). Cierres explícitos en eventos posteriores y otras ventanas conservan la lógica nativa. Usa values_.intercept_ de la administración observable auditada; si no existe, no interviene. No reemplaza el enrutador de teclas ni los botones. Escape continúa por el registro nativo a_ (closeTop); inputs/composición siguen las reglas nativas. V es alias nativo del inventario; su atajo configurable predeterminado es I. No cambia atajos.

## Staffs: causa y precisión

Con Soul Master (clase 2), Str/Agi/Vit/Ene 65535 y equipo en el slot primario 0, las funciones extraídas sin modificar reproducen exactamente:

| Staff | Físico nativo | Mágico nativo | Tasa nativa | Tooltip Wizardry | Additional | Excellent rate |
| --- | --- | --- | --- | --- | --- | --- |
| Archangel +0 | 8244–16438 | 7281–16383 | 0 | 53% | 0 | 0% |
| Excellent Kundun +13 | 8294–16493 | 7281–16383 | 0 | 110% | 16 puntos | 10% |

Wizardry (j3e / calculateWizardry) consulta exclusivamente slot 1. Omite el staff de slot 0 aunque el inventario lo admite. Es la causa demostrada para este fixture, compatible con todos los valores informados; falta observar el slot de la cuenta para confirmar esa instancia real. No es evidencia de equipo incorrecto del usuario.

La base de energía es trunc(Ene/9) y trunc(Ene/4). El cálculo nativo añade itemDamage del staff solamente si está en slot 1 y muestra itemMagicPower separado; no multiplica el rango por la tasa. Additional Wizardry (optionLevel × 4) y Excellent Damage Rate (excellentFlags & 32, 10%) pertenecen al tooltip, no intervienen en Wizardry nativo. El tooltip nj también tiene reglas específicas y no debe sustituirse por el cálculo Character Info; Helper reutiliza ese export para leer 53/110. Datos del catálogo de fallback público se verifican con el tooltip independiente; el catálogo cargado durante una sesión real puede requerir otra validación.

Se corrige la lectura/presentación del porcentaje mediante el tooltip del staff real en cualquiera de los dos slots, sin moverlo. Se conservan y etiquetan los valores nativos, se advierte la omisión de slot 0 y se separan base, tooltip y opciones. No se entrega un rango mágico corregido ni daño efectivo supuesto. Buffs, skill y defensa enemiga no están resueltos. Falta catálogo, nivel u opciones: No disponible; dos staffs: bonus único no disponible. Cero solo para datos explícitos confirmados.

A/B conserva copias; Δ=B−A, diferencias de tasas en puntos porcentuales y cambio relativo=(B−A)/A×100; A=0 no genera porcentaje. Condiciones y fuentes en tooltips/desplegable. Capturas actuales en docs/screenshots/character-stats-c-v-preview.png, character-stats-preview.png character-stats-ab-full-preview.png y character-stats-compact-preview.png.

## Validación y límites

Fixture reproducible: scripts/character-client-fixture.cjs extrae fórmulas, constantes y MobX del bundle auditado; falla ante otro hash. Genera demos/helper/character-client-audited.js sin motor ni arranque del juego. character-native.test.cjs verifica catálogo, tooltip, todos los valores físicos/mágicos informados, opciones, falta de datos y excepción C/V con MobX real. La demo character-panels.html simula los diálogos y su foco; los números provienen de funciones extraídas, no de valores inventados para la captura.

UI: Guardar/Cancelar, toggle, no apertura de C al guardar o recargar, C→V/V→C por teclado y botones, cierre individual, Escape/inputs, recreación, A/B, cambio manual de staff con Play pausado, carga, personaje, incompletos y viewport 375×640. Cuenta/perfil y extensión se validan además en sus suites existentes. El servidor local resuelve todos los scripts de la demo. Sin intervalos, paneles o comandos nuevos del addon; se conservan las automatizaciones preexistentes del demo, separadas de la lectura de stats.

Límite: evidencia estática y demos aisladas. Falta confirmar importación/hook, disposición visual con sprites/layout reales, slot observado, actualizaciones y valores del catálogo de la partida real. No se usó una cuenta, instaló extensión ni publicó en la web.

---

# Historial de la implementación anterior

# Estadísticas detalladas · Helper 1.19.0 y HUB 1.4.5

Config → Estadísticas → Estadísticas detalladas → Guardar. Apagado por defecto; funciona con Play pausado. Capturar A guarda el equipo actual, cambiá el staff manualmente y usá Capturar B. Capturar A nuevamente descarta B. Limpiar comparación borra ambas. No equipa ni combate.

## Evidencia pública del 2026-10-08

Se consultó https://mu.mormon.garden/ sin cuenta. Entry publicado: `/assets/index-DnTsp0bZ.js`; el módulo de arranque `/assets/boot-BiqAhQ9L.js` importa `b2` de `/assets/layout-DyxNG9m6.js` como `eR` y lo invoca en la ventana Character Info con clase, nivel, atributos y `playerData.items`. Su resultado contiene `damageMin/Max`, `wizardryMin/Max`, `staffRate`, defensa e índices. El rango mágico y el porcentaje del staff se muestran separados por el cliente; no se aplica arbitrariamente ese porcentaje al rango.

La fuente pública correspondiente es [characterStats.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/common/characterStats.ts), función deriveCharacterStats. [store.ts](https://github.com/Ignies/OpenMu-Client-Babylon/blob/main/src/store.ts) define atributos, equipo y velocidades attackSpeed/magicSpeed recibidas del servidor cuando disponibles. En el bundle verificado las manos son slots 0/1 y la base de items es el export `bW`, con `getItem(group,num)` y `ItemName`.

Helper reutiliza el módulo ya cargado con import dinámico, solo en el origen del juego y si el entry coincide exactamente con el auditado. No copia fórmulas, crea store ni ejecuta otro motor. Sin compatibilidad, catálogo completo, datos completos o permiso de carga, los valores calculados figuran No disponible. Un nuevo build requiere revalidar este adaptador. El módulo layout auditado tiene SHA256 `D72DC219FACDAF835443E76C28FB385EE8D4D3F3D52844D71E76D934CCDEF325` (evidencia local en artifacts/stats-research).

## Precisión y comparación

Rangos e índices se etiquetan mediante tooltips como **Calculado por el panel nativo**: no son una respuesta de daño efectivo del servidor. Atributos, máximos de recursos y velocidades se presentan como informados por el cliente; sin velocidades recibidas no se agrega una fórmula alternativa. Daño por skill, buffs y daño contra enemigo permanecen no disponibles/desconocidos. No garantiza efectos de Excellent, Luck, defensa enemiga o buffs que el cálculo nativo no incluya.

Las capturas conservan copias de los 12 slots equipados, atributos y skill seleccionada. Se señalan cambios de nivel/atributos, equipo adicional y skill; buffs desconocidos impiden atribuir exclusivamente la diferencia al staff. Cada rango se compara por extremo. Porcentaje = (B − A) / A × 100, sin porcentaje para A=0. Datos faltantes no se convierten en cero.

## Persistencia e integración

Preferencia opcional `detailedStats` booleana en el formato v1 del perfil por mundo/cuenta. Ausencia equivale a false; conserva Guardar/Cancelar y rollback. Capturas solo en memoria; se limpian al desactivar, desconectar, entrar en carga, cambiar cuenta/servidor/personaje/clase o recargar. Play no interviene. Lectura/render desde refresh existente cada 500 ms, sin intervalos nuevos.

Helper agrega `getState().detailedStats` opcional; HUB 1.4.5 lo usa únicamente para elevar su presentación sobre el Radar flotante cuando está activo, evitando que tape la comparación. Contrato v1 conservado. Config no cambia.

## Validación

Tests de lógica y UI con fixtures aislados: datos incompletos, equipo desconocido, base cero, copias independientes, identidad, Guardar/Cancelar, Play pausado, ausencia de nuevos comandos, recarga, standalone/HUB y viewport 375×640. Las capturas visuales usan un cálculo simulado explícito para mostrar A/B; no confirman los números del servidor. Reutilización del export auditada estáticamente en código público, sin cuenta. Falta confirmar carga y coincidencia de valores con el panel nativo en partida real.

El gestor local reintenta durante hasta un segundo los errores transitorios EPERM/EACCES/EBUSY de renombrado en Windows. Una prueba inyecta dos fallas y verifica la promoción; errores definitivos siguen propagándose y conservan el comportamiento de restauración.

Release local validado: 147 pruebas de lógica y 18 suites UI, incluida extensión aislada. Helper 1.19.0, HUB 1.4.5, extensión 1.0.4. Hashes de todos los módulos fuente/dist/manifiesto y checksum del ZIP coincidentes. Conjunto 2026-10-08T23-51-05-502Z-495dd2; evidencia en artifacts/stats-research/release.log.

## Ventana flotante · Helper 1.19.1 y HUB 1.4.6

Esta sección sustituye el montaje del panel dentro del HUB descrito para 1.19.0: el mismo panel vive ahora en #mu-helper-stats, con Shadow DOM propio y posición fija en document.body. El motor sigue siendo Helper. El botón del gráfico muestra/oculta desde HUB o standalone. El candado desbloquea arrastre por cabecera; las flechas mueven la cabecera enfocada. Minimizar HUB no afecta la ventana. Ocultar conserva A/B y la lectura; desactivar desde Config limpia capturas. Mostrar al iniciar sesión/recargar si la preferencia está habilitada.

Posición y candado en mu.level-helper.stats-position.v1; demo mu.level-helper.demo-stats-position.v1, sin capturas guardadas. Se ajustan al viewport al redimensionar. HUB monta la capability.actions del Helper y ya no eleva su capa por detailedStats. El ancho se ajusta para mantener los controles adicionales y minimizar visibles. Actualizar Helper y HUB juntos o la extensión conjunta.

Release flotante validado: 147 pruebas de lógica y 18 suites UI, extensión 1.0.5, conjunto 2026-10-09T00-38-31-034Z-30b782. Todos los hashes fuente/dist/manifiesto y checksum ZIP coincidentes. Evidencia en artifacts/stats-research/floating-release.log; capturas con cálculo demo, sin cuenta real.


## Entrega conjunta verificada

Release local 2026-10-09T01-18-43-977Z-247c34 (2026-10-08 en Buenos Aires): Helper 1.20.2 contiene esta integración y los toggles de pasos implementados en paralelo. HUB 1.4.6, extensión 1.0.7. Pasaron 151 pruebas de lógica y 18 suites UI, incluida la extensión Chromium aislada. Todos los hashes de fuente/dist/extensión coinciden; ZIP SHA256 57f4f1a659f8a5d78334448df2c4a3b8de26efbbb572f4812e9db464cf008a36. Evidencia en artifacts/stats-research/character-info-coordinated-release.json (comando exitoso, salida parcial y reporte del chat coordinado) y character-info-final-verification.json (verificación independiente de hashes). Los intentos anteriores bloqueados/fallidos quedaron registrados; no se saltó ninguna validación ni se revirtió trabajo concurrente. Instalación y partida real pendientes.
# Corrección Helper 1.20.4 · UI clásica

El reporte persistente se diagnosticó mediante lectura del DOM de la pestaña del usuario: Character tiene clase `mu-item-window v097d-window v097d-character`, sin `character-info`. El código solo reconocía Season 6. Los selectores de montaje ahora incluyen `v097d-character` y `v097d-inventory`; la UI pública `index-Gfr1neN0.js` y su CSS confirman esos nombres. La demo y la suite de regresión recorren ambos skins; el clásico tiene altura 433 px. No se instaló ni se modificó la partida al diagnosticar.

# Corrección Helper 1.20.3

El detalle y las capturas A/B permanecen visibles en C si falta el adaptador nativo. Los cálculos sin fuente muestran No disponible y un aviso explica la limitación. La excepción al cierre mutuo C/V exige el adaptador compatible. La detección del script de entrada puede esperar sin consumir el intento de carga. El adaptador público se probó sin cuenta en Chromium aislado; esto no confirma la causa del reporte en el navegador del usuario ni funcionamiento en partida.
