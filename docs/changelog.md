## 2026-10-14 · Helper 1.29.3 · C/V movibles

- Retira escrituras de position/left/top/right/bottom/transform sobre ventanas nativas. El refresh no hace snapping ni modifica escala, posición o almacenamiento nativo, con stats ON/OFF.
- El detalle adjunto usa la posición y escala medidas de C y se acomoda a derecha/izquierda o arriba/abajo con scroll; solo modifica su propio host. El cliente sigue a cargo del arrastre, bloqueo, límites y persistencia de C/V.
- Prueba de arrastre en ambos skins: posición y estilos nativos sobreviven refresh, cambio de equipo, A/B, stats OFF, recreación y recarga. Persistencia simulada con claves exclusivamente demo; funcionamiento del drag real conserva el motor del cliente.

## 2026-10-14 · Helper 1.29.2 · C/V con reacciones nativas reales

- Retira nativePair, que evitaba instalar el hook de coexistencia en el build actual. index-D5yEXyzD.js sí instala cierres mutuos mediante jt/X0; la auditoría anterior había omitido ese módulo.
- Fixtures con MobX vigente y registro/installer reales: reproducen exclusividad sin hook, C→V y V→C con hook, cierres individuales, terceros menús y restauración OFF. La suite browser ya no usa booleans planos preencendidos como prueba de convivencia.
- Conserva el switch independiente, autoguardado, detalle automático y controles nativos. No abre ventanas ni inicia Play por restaurar preferencias. Validación local sin cuenta real; partida real pendiente.

## 2026-10-14 · Helper 1.29.1 · Detalle automático

- El switch detallado determina la visibilidad al abrir C manualmente, sin otro toggle por sesión. Funciona al activar con C abierta, al recrear la ventana y al recargar. Apagar conserva la limpieza de capturas.
- Retira el gráfico del juego/HUB, el botón Detalle en C del Centro de control y minimizar el detalle. El puente deja de aceptar la acción de toggle antigua; mantiene el estado informativo opcional statsVisible. No cambia contratos ni claves de preferencias.
- Pruebas con ambos skins, persistencia, recreación y panel MV3; sin cuenta real ni instalación.

## 2026-10-14 · Helper 1.29.0 · Estadísticas y configuración inmediata

- Detalle de C solo con métricas y A/B. Retira filas de equipo y nombres de objetos de las capturas visibles; conserva snapshots internos para advertir condiciones cambiadas.
- Estadísticas detalladas se suma al autoguardado por mundo/cuenta, independiente de C/V y Play. Cancelar y rollback conservan los switches confirmados; errores de almacenamiento restauran su valor. Ambos usan switches ON/OFF.
- Config: ayuda con hover, foco, Enter o toque en «?». El Centro de control oculta Guardar/Cancelar y texto explicativo en Estadísticas; conserva estados operativos. La vista queda accesible después de Escape sin Abrir configuración. Otros borradores mantienen la transacción original.
- Nuevo adaptador auditado index-C399rQbj/layout-68bM4dWi: FPt b1, Co bU, se aL y _g np. La conclusión inicial sobre ausencia de exclusividad mutua fue incorrecta: omitía index-D5yEXyzD y se corrigió en 1.29.2.
- Fixture de cálculo extraído del cliente público, prueba de descubrimiento/import con HTTP interceptado, degradación de build desconocido, autoguardado con falla simulada, A/B, skins y panel MV3. Sin cuenta real ni instalación.

## 2026-10-14 · Radar 1.9.2 · Nombre de Arena en el minimapa

- Completa el catálogo con Arena (6), Arena 2 (83), Arena 3 (84) y Arena 4 (85). El título usa el mapa actual y conserva las coordenadas; nombres también disponibles en el desglose de invasión.
- Regresión de interfaz: cambios entre las cuatro Arenas, retorno a Lorencia y fallback de mapa desconocido. Validación local con demos; partida real pendiente.

## 2026-10-14 · Helper 1.28.0 · Invitaciones con espera

- Party agrega «Invitar fuera del clan» independiente de sendParty y apagado por defecto (sendPartyOutside opcional en preferencias v1 por mundo/cuenta). Guardar/Cancelar y panel externo conservan el formulario original. Auto party no cambia.
- Ambos grupos esperan 2000 ms de presencia cercana observada. Prioridad por inicio de presencia, distancia e ID; límites de 10 s globales y 60 s por nombre conservados. Cancelación por pérdida de elegibilidad, pausa, cambio de mapa/entidad/personaje/cuenta/servidor o desconexión; sin otro scheduler.
- Solo IDs de clan confirmados: la ausencia de guild no distingue falta de clan de datos pendientes. No invita candidatos desconocidos ni sin componente, ni con clan propio desconocido. Terceros no activa expulsiones; sendParty conserva la política previa en mapas 6/10.
- Pruebas con reloj controlado y demos aisladas; instalación y partida real pendientes.

## 2026-10-13 · Helper 1.27.0 · Caza del Balrog Colosal

- Sección Caza con switch automático por cuenta, apagado por defecto. Play/Pausa en juego y panel externo con ubicación vigente recibida del cliente; inicio explícito por evento.
- Reutiliza navegación, warp confirmado, scheduler y Home de Helper. Pausa leveleo, activa Home al llegar; Pausa de Caza detiene Home y lo libera para uso manual. Fin/cambio de destino/identidad y fallos acotados cancelan acciones; no se rearma al siguiente evento.
- Anuncios específicos y recuperación del lector público auditado; horarios sin destino no habilitan viaje. Golden hunt continúa inerte y contador de Radar intacto.
- Pruebas de lógica y demos de viaje/Home, Pausa/Home manual, reset pendiente, fin durante warp, identidad y panel MV3. Sin cuenta real; partida real pendiente. Detalle en balrog-client.md.

## 2026-10-12 · Helper 1.26.1 · Home manual después de Pausa

- Pausa detiene Home y espera su confirmación; después libera el control para permitir activarlo manualmente sin que el addon vuelva a apagarlo.
- Regresión del scheduler real en demo: Home manual permanece activo con Play pausado. Validación local; partida real pendiente.

## 2026-10-12 · Helper 1.26.0 · equipo completo y switch C/V

- Adaptador revalidado para el build público actual: recupera stats y hook C/V antes bloqueados por la entrada antigua.
- Lectura por los 12 slots equipados, propiedades y tooltip nativo, estados parciales y comparación A/B con piezas cambiadas; sin sumar bonus al rango nativo.
- Permitir C e inventario juntos: switch persistente por cuenta y autoguardado, independiente del lector y Play, proyectado al panel externo. Cancelar conserva su cambio; apagar restaura exclusividad en aperturas posteriores.
- Fixtures extraídos del build actual y validación local sin cuenta real. Partida real pendiente.

## 2026-10-11 · Helper 1.25.0 · Play/Pausa dentro del juego

- Mini control independiente del panel y HUB, movible con posición persistida y limitada al viewport.
- F10 reutiliza Play/Pausa; ignora repetición, modificadores y campos de escritura. Sin motores ni intervalos nuevos.
- Validación local; funcionamiento y conflictos de teclas en partida real pendientes.

## 2026-10-11 · Helper 1.24.2 / HUB 1.4.7 · retiro de Golden hunt

- Retirados G y Goldens del panel externo, HUB y Helper. Acción antigua inerte; el puente la rechaza. Sin listener de cacería ni posibilidad de armarla por evento.
- Preferencias históricas conservadas al guardar otras secciones; contrato v1 sin migración. Contador total/por mapa de Golden Invasion, minimapa e historial conservados.
- Regresión local de retiro sustituye las tres suites de cacería publicada; pruebas puras históricas conservadas. Release local aprobado: 183 pruebas de lógica y todas las suites vigentes; extensión 1.0.24. No se probó en partida real.

## Helper 1.24.1 · Reingreso tras reset con ejecución demorada (2026-10-11)

- El reset usa un presupuesto finito de espera observada: cada ejecución aporta como máximo 5 s. Una pausa larga del documento no consume todo el plazo antes de evaluar la selección disponible; conserva 30 s para confirmar el reset sin selección y 90 s para el reingreso.
- Selección exacta del personaje original, hasta tres intentos separados por al menos 10 s de espera observada. No reintenta durante carga de lista/escena o ingreso al mundo ni vuelve a enviar /reset. Solo confirma reset al observar el personaje listo y descenso de nivel.
- Verifica cuenta/servidor del ciclo y captura rechazos/excepciones de selección. Pausa manual, logout, identidad desconocida y cambio de cuenta cancelan la operación; recuperar identidad no reinicia Play.
- Regresiones de reloj demorado, confirmación tardía, lista, intentos agotados y cancelación; prueba Chromium con el flujo de identidad de producción, sin cuenta real. No garantiza actividad con pestaña congelada/descartada. Validación real pendiente.

## Extensión 1.0.22 · Revamp UI opción A (2026-10-10)

- Contenido usa el ancho disponible debajo de la barra superior conservada. Se retiran la card exterior y cards de spots/destinos; títulos por sección, filas y separadores organizan ajustes.
- Leveleo: mapa, habilitación y nivel en línea, spots en filas, progresión y switches a la derecha. Goldens y Obtener separan editor/opciones; Trackeo y Estilos en columnas. Party y Estadísticas se mantienen simples.
- Columnas apiladas en ventanas angostas, sin controles duplicados ni movimientos de nodos. Se conservan motores, permisos, almacenamiento, transacciones, foco y Tampermonkey standalone.
- Abrir configuración aparece al cerrar el formulario; texto del pie distingue switches automáticos de Guardar. Regresión de barra fija usa borrador largo explícito.
- Capturas antes/después con mismos datos en artifacts/ui-revamp; pruebas locales de geometría, foco, teclado, recuperación y suite funcional del panel. Release local oficial, sin instalación ni publicación web.

## Helper 1.24.0 · Switches con guardado automático (2026-10-10)

- ON/OFF visible para spots, Usar este mapa, Reset automático al nivel 400 y Mantener Soul Shield. Desde nivel queda debajo de Usar este mapa.
- Cada switch guarda solo su campo por cuenta y conserva borradores de coordenadas, niveles y otros ajustes. Cancelar no revierte switches ya guardados; rollback de Guardar conserva esa nueva base.
- Spots nuevos o con coordenadas/estructura pendientes requieren Guardar primero. Conflictos de sesión, otra ventana o almacenamiento revierten el control e informan No guardado. No inicia Play.
- Pruebas en demos y extensión aislada, incluyendo persistencia, conflictos, rollback y error de almacenamiento. Partida real pendiente.

## Centro de control · Conectar y reconectar (2026-10-10)

- Botón principal Conectar/Desconectar; flecha para Reconectar. Desconectar y reconectar descartan borradores sin cambiar Play ni recrear motores.
- Selector de pestañas actualizado al enfocar panel/selector y antes de reconectar. Tooltips explican la diferencia con recargar el juego.

## Radar 1.9.1 · Restantes por mapa visibles (2026-10-10)

- El panel de invasión muestra una fila por mapa con su cantidad restante, además del total; ya no requiere hover para consultar el desglose.
- Conserva ceros explícitos y muestra Sin datos por mapa cuando el desglose no está disponible o venció. Posición, candado y motor existentes.

## Radar 1.9.0 · Contador flotante de Golden Invasion (2026-10-10)

- Total nativo en ventana independiente dentro del juego, también con el Centro de control de la extensión. Visible durante invasión activa, con Play pausado.
- Desglose por mapa en tooltip, candado y posición persistentes propios; no depende de avistamientos ni modifica Golden hunt.
- Ausencia o vencimiento muestra Sin datos; cero requiere dato explícito. Cambio de identidad y desconexión invalidan el contador.
- Pruebas locales sin cuenta real; invasión real pendiente de verificar.

## Centro de control · Barra superior fija (2026-10-10)

- Navegación global, selección de partida, secciones de Helper y Play/Pausa permanecen arriba durante el scroll, también en ventanas angostas.
- La detección de paneles usa contextos propios de la extensión para evitar duplicados sin ampliar permisos.
- Las secciones usan los controles originales del formulario; Guardar/Cancelar, perfiles y motores conservan su funcionamiento.
- Actualizar extensión muestra versión y explicación: recarga archivos locales, no descarga ZIP. Confirmar descarta el borrador y reconecta manualmente; Cancelar/Escape conservan la edición. El juego no se recarga automáticamente.
- Validación en Chromium aislado con scroll, solicitud de recarga y restauración ante evento de actualización simulado. Sin instalación ni partida real.

## Helper 1.23.0 · Mapas y spots manuales (2026-10-10)

- Selector de los 26 destinos, nivel de entrada por mapa, spots X/Y habilitables, duplicación, eliminación y captura con identidad/destino verificados.
- Un spot estable por visita; siguiente mapa al alcanzar el umbral aun con enemigos. Pausa, muerte y Golden hunt conservan selección; reset cambia la visita. Empates estables y mapas incompletos omitidos.
- Migración solo al Guardar, respaldos y editor anterior recuperables. Sin mapas utilizables bloquea Play; fallas de viaje/camino/progreso pausan con motivo.
- El panel invalida referencias de campos eliminados antes de retirar filas; cambiar de mapa con una coordenada enfocada conserva la conexión.
- Centro de control MV3 y standalone comparten el editor original y Cycle. Validación local con demos, sin instalar ni operar una cuenta real. [Uso](level-routes.md).

## Helper 1.22.1 · Captura de ubicación (2026-10-10)

- La captura acepta el mapa actual cuando escenario y personaje coinciden, aunque el último paquete de viaje sea histórico. Mantiene el bloqueo durante carga, muerte o discrepancias actuales.
- Los errores identifican la condición concreta y los mapas en conflicto; no modifican la fila ni guardan datos cuando la ubicación no está confirmada.
- Regresión local de Arena con paquete histórico; causa exacta del reporte en partida real pendiente de confirmar.

## Panel externo de extensión · Config 1.3.1 / Analytics 1.1.4 (2026-10-10)

- El icono abre/enfoca una pestaña propia con Config, Radar/historial y Analytics. HUB/configuración se ocultan en el juego; minimapa opcional.
- Proyección incremental de controles originales: conserva formularios, validación, Guardar/Cancelar, rollback, perfiles y motores únicos. Ningún servidor localhost.
- Selección explícita de pestaña, generación por documento/identidad y lease por conexión. Desconexión invalida controles; no reintenta acciones ni inicia Play automáticamente.
- Worker limitado a apertura y mensajería, puente ISOLATED/MAIN, CSP de extensión y permisos limitados al origen del juego. Fuentes canónicas en src/extension; hashes y rollback de assets históricos.
- Analytics permite inicio desde panel con juego oculto y confirmación de borrado en el panel. Standalone conserva interfaz/confirmación anteriores.
- Config conserva Escape para Tampermonkey; en extensión, Escape del juego no cierra ni intercepta el formulario externo. Escape en el panel cancela el borrador.
- Pruebas en Chromium aislado con fixtures; instalación habitual y partida real pendientes. [Uso y arquitectura](extension-panel.md).

## Helper 1.22.0 · Rutas y spots observados (2026-10-10)

- Hasta ocho rutas por perfil, selector/nombre/duplicación, alternativas por etapa y turnos de al menos tres minutos sin combate. Rutas anteriores conservadas; Guardar no inicia Play.
- Captura pasiva de concentraciones cercanas confirmadas, limitada por cuenta/mundo/servidor, con antigüedad y generación de borradores Lorencia/Noria → Arenas accesibles. No inventa spawns ni promete indetectabilidad.
- Navegación valida casillas/caminos, excluye candidatos fallidos por sesión y pausa al agotarlos; loot sigue el spot activo. [Contrato, evidencia y límites](level-routes.md).
- Pruebas de lógica y demo Chromium aislada; partida real pendiente.

## Helper 1.21.0 · Usar ubicación actual (2026-10-09)

- Cada fila permite reemplazar mapa y X/Y del borrador sin agregar pasos ni cambiar nivel, habilitación u orden. Guardar aplica; Cancelar/cierre/Escape descartan y minimizar conserva.
- Captura atómica desde snapshot: rechaza datos ausentes, fuera de rango, carga, muerte, discrepancias de mapa y cambios de identidad/personaje desde la apertura. No inicia Play ni envía comandos.
- Solo IDs únicos del catálogo; Arena 2/3/4 se reconocen con 83/84/85. Los IDs compartidos se rechazan incluso si la fila ya seleccionó una variante: no hay evidencia suficiente para preservarla. La precarga de + mantiene su comportamiento vigente.
- Nivel incompatible informado por la validación existente. Pruebas locales sin cuenta real; partida real pendiente.

# 2026-10-08 · Helper 1.20.4 · Character Info clásico 0.97d

- Corrige la causa del detalle ausente observada en el DOM del navegador: la interfaz clásica usa v097d-character/v097d-inventory, mientras Helper solo buscaba character-info/inventory de Season 6. Ahora reconoce ambos skins sin duplicar ventanas ni controles.
- Regresión completa de C/V y A/B en ambos skins, incluyendo 433 px de alto del clásico, cierre, teclado, vista compacta y recarga. Lectura real del DOM sin intervenir la partida; la corrección todavía requiere actualizar el instalado.

# 2026-10-08 · Helper 1.20.3 · Detalle disponible sin adaptador

- C conserva detalle y Capturar A/B aunque el adaptador nativo no esté disponible. Muestra un aviso y cálculos desconocidos como No disponible. No habilita la excepción C/V sin compatibilidad verificada.
- La detección del entry puede esperar a que aparezca el script, sin consumir prematuramente el intento de carga. La causa concreta en el navegador del usuario sigue pendiente; el módulo público carga correctamente en Chromium aislado sin cuenta.
- Regresión de interfaz: adaptador ausente, detalle visible, capturas operables y métricas desconocidas. Validación en demo; partida real pendiente.

# 2026-10-08 · Helper 1.20.2 · Toggles de leveleo

- Activación por paso con spot conservado; selección solo de destinos activos, persistencia compatible y mínimo de un paso activo. Guardar recalcula el ciclo; Golden hunt aplica al retornar.
- Validación con lógica y demo local; partida real pendiente.

# 2026-10-08 · Helper 1.20.1 · Character Info y staffs

- Detalle integrado como extensión de C; gráfico como toggle, apagado al recargar. C no abre automáticamente. Preferencia y A/B por mecanismos v1 existentes.
- Excepción limitada al cierre mutuo C/inventario del build público auditado; teclado/botones/cierres/Escape nativos. Distribución temporal adaptada al viewport sin clonar controles de puntos.
- Lectura independiente del tooltip de staff: 53% Archangel y 110% Kundun +13, adicionales y Excellent rate; rango/base nativos etiquetados, aviso de omisión slot 0. Sin inventar daño efectivo.
- Fixtures extraídos del bundle reproducen los valores informados y verifican la causa en slot primario 0. Partida real pendiente; [evidencia y límites](character-stats-client.md).

# 2026-10-08 · Helper 1.19.1 / HUB 1.4.6 · Estadísticas flotantes

- Estadísticas en ventana independiente del HUB, con candado, arrastre por cabecera, movimiento con flechas y posición guardada. Botón propio de mostrar/ocultar en HUB o barra standalone.
- Ocultar conserva A/B; minimizar HUB no oculta la ventana. Desactivar en Config sigue limpiando las capturas. Misma lectura/cálculo desde refresh, sin nuevos intervalos ni comandos.
- HUB monta capabilities.actions también para módulos legacy; ajusta su ancho cuando hay más controles y conserva minimizar al final. Contrato v1 y preferencias existentes conservados.
- Pruebas de arrastre, candado, ocultar/reabrir, independencia del HUB, reload y viewport compacto; sin cuenta real.
# 2026-10-08 · Helper 1.19.0 y HUB 1.4.5 · Estadísticas detalladas

- Pestaña Estadísticas con opción apagada por defecto, Guardar/Cancelar y perfiles existentes. Panel actual y capturas A/B manuales, diferencias y condiciones; independiente de Play, sin comandos ni cambios de equipo.
- Reutiliza cálculo del panel nativo del build público auditado para rangos físicos/mágicos, bonus del staff, defensa e índices; datos ausentes y daño efectivo no se inventan. Capturas en memoria, limpiadas por identidad/desconexión/desactivación.
- HUB eleva su presentación al habilitar stats para evitar que el Radar flotante tape el panel. Contrato v1 conservado, Config sin cambios. Fuentes y límites en docs/character-stats-client.md.
- Reintento acotado de renombrados transitorios en Windows durante promoción/rollback, con prueba de fallas inyectadas; conserva validaciones y recuperación. Pruebas de lógica y UI en demos sin cuenta real; partida real pendiente.
# 2026-10-07 · Helper 1.18.1 · Mínimos de MG

- Reconoce Magic Gladiator (12) y Duel Master (13) desde playerData.charClass; aplica los 26 mínimos de la ventana M enviada por el usuario. Arena 2/3/4: 66/132/198; Icarus: 112.
- Validación, etiquetas, cambio de mapa, rutas predeterminadas y Goldens usan la clase activa. Las rutas persistidas se validan estructuralmente sin tratarlas como corruptas al cambiar de clase o cerrar sesión; Play rechaza una ruta incompatible con la clase actual.
- Conserva los niveles elegidos y las claves por cuenta. Otras clases mantienen los mínimos generales. Pruebas de la ruta del usuario, límites, precarga, recarga y separación de clases; sin cuenta real.
- Release local con 142 pruebas de lógica y 17 suites de interfaz, incluida extensión 1.0.3. Hashes de fuente, instalable y manifiesto coincidentes. Evidencia: `artifacts/mg-minimums-release.log`.

# 2026-10-07 · Helper 1.18.0 / Config 1.3.0 · Configuración por cuenta

- Helper separa ajustes por mundo y cuenta autenticada, compartidos entre personajes de esa cuenta. Identidad desconocida bloquea Play y guardar; cambiar cuenta pausa acciones propias y descarta solicitudes pendientes.
- La configuración global anterior se conserva sin cambios y se importa explícitamente desde Config con Guardar/Cancelar. Radar, historiales y posiciones continúan generales. Party requiere Play en los perfiles nuevos.
- Web Locks y comparación del registro inicial coordinan ventanas concurrentes. Config espera guardado/rollback asíncronos; actualizar ambos módulos juntos. No se cambia el contrato de registro v1.
- Pruebas locales de cuentas, personajes, logout, recarga, importación y conflictos concurrentes. No se accede a cuentas reales ni se modifica la autenticación del juego. Detalles en [configuración por cuenta](account-settings.md).
- Release local verificado: 139 pruebas de lógica, 17 suites de interfaz y hashes src/dist/manifest coincidentes; extensión 1.0.2. Se reutilizaron reintentos acotados de rename de Windows, sin omitir validaciones. Log en `artifacts/account-settings-release-final.log`.

# 2026-10-07 · Helper 1.17.2 · Recuperación de Home

- Libera la solicitud de Home al vencer la confirmación, para que un nuevo Play pueda reintentar. Antes, la solicitud vencida producía timeout inmediato en todos los intentos siguientes.
- Detecta el bloqueo nativo de inicio en zona segura y muestra cómo recuperarse. Los timeouts distinguen activación y pausa; registra dirección, estado y mapa en consola.
- Regresiones locales para timeout en ambas direcciones, reintento confirmado y zona segura. No se modificó la instalación ni se realizaron acciones en la cuenta real; la causa inicial del caso observado sigue sin confirmar.
- Release validado con 137 pruebas de lógica y 16 suites de interfaz, incluida extensión con perfil aislado. La validación utilizó reintentos acotados de rename ante bloqueos transitorios de Windows, sin omitir checks ni modificar el gestor publicado; evidencia en artifacts/home-recovery-release.log.

# 2026-10-07 · Extensión local Chrome MV3 1.0.0

- Release genera el conjunto completo en `dist/chrome-extension` usando fuentes canónicas sin transformarlas; userscripts siguen disponibles y contrato/almacenamiento continúan en v1.
- MAIN/document_idle únicamente en HTTPS mu.mormon.garden, sin popup, background, permisos adicionales ni código remoto. Orden Radar, Helper, Config, Analytics, Interface y HUB.
- Radar 1.8.3, Helper 1.17.1, HUB 1.4.4, Config 1.2.1, Analytics 1.1.3 e Interface 1.1.2 incorporan un guarda de instancia que funciona aun con hosts movidos a Shadow DOM. Se conserva el trabajo previo de Helper 1.17.0.
- Paquetes inmutables, hashes, versionado independiente, retención protegida por conjuntos y rollback compatible con conjuntos sin extensión. Detección de cambios del generador/validaciones durante release.
- Pruebas del paquete y navegador real con perfil desechable y fixtures interceptados, sin cuenta ni conexión al juego. Respuesta pública de la raíz verificada sin headers ni meta CSP; instalación habitual y partida real no verificadas.

## 2026-10-07 · Helper 1.17.0 · Catálogo de alas

- Conserva Originales y Blade Knight y agrega los otros 15 estilos del slot de alas reconocidos en el cliente público actual, incluidas Cape of Lord y Mantle of Monarch. IDs y nombres contrastados con catálogo y wingSpec desplegados; Fighter/Overrule upstream no se incluyen porque faltan en el despliegue.
- Guardar recuerda `wingStyle` opcional en la misma clave de preferencias v1; registros anteriores usan Originales. Cancelar y rollback conservan el estado previo. Casco continúa por sesión.
- Reutiliza exclusivamente el adaptador de render propio; preserva equipo, stats, nivel/brillos y mecánicas. Cambiar entre estilos invalida cargas pendientes. No cambia otros módulos ni contrato v1.
- Pruebas de los 16 estilos en renderer simulado y demo, persistencia/restauración, ausencia de alas, fallas y coexistencia con casco. Recursos/encaje/animación en partida real pendientes; catálogo completo de futuras versiones no garantizado. Evidencia en docs/wings-client.md.

## 2026-10-07 · Helper 1.16.0 / Radar 1.8.2 / Config 1.2.0 · Visualización y alas

- Visualización reúne Trackeo (dorados, White Wizard Corps y Red Dragon) y Estilos (casco y alas). Los controles originales de Radar se montan dentro de Trackeo; conservan motor, preferencias v1 y transacción Guardar/Cancelar.
- Selector de alas Originales / Blade Knight (Wings of Dragon). Cambia solo el renderizado del personaje propio con alas equipadas, conserva nivel visual y equipo/stats; estilo por sesión. Suspende en cargas, transformaciones y Chaos Castle, restaura la apariencia actual al desactivar y maneja fallas asíncronas sin detener el ciclo.
- Config acepta slots opcionales del proveedor de ajustes, con presentación por secciones cuando falta el destino. No modifica HUB ni agrega timers/comandos.
- Pruebas del adaptador y demo integrada cubren aislamiento, restauración, cargas pendientes, Guardar/Cancelar/rollback, recarga y viewport compacto. Apariencia real en partida pendiente.

## 2026-10-07 · Helper 1.16.0 · Home continuo durante leveleo

- Retira los sondeos de Lorencia que apagaban Home, caminaban unas casillas y lo reiniciaban cada pocos segundos cuando no había combate. Home conserva su búsqueda nativa y movimientos cercanos.
- Conserva llegada/retorno al spot, viajes, reset, pausa manual y control exclusivo durante Golden hunt. Sin cambios de preferencias ni contrato v1.
- Regresión con el scheduler en demo: 60 segundos quieto y con movimiento corto, un único inicio de Home, ninguna parada y detención al pausar Play. Partida real pendiente.

## 2026-10-07 · Interfaz 1.1.1 · Marco ornamental corregido

- Sustituye la textura de rombos de 1.1.0 por dos placas con canales, remaches y relieves basadas en la propuesta aprobada. Extremos fijos mediante border-image; solo el interior se adapta al ancho. Sin patrón repetido en los laterales.
- Conserva distribución central, margen para chat, controles y sprites nativos. Arte embebido WebP (23010 bytes), sin URL externa.
- Evidencia adicional sobre captura instalada de 1.1.0: interface-ornate-reference-preview.png, montaje estático de los nuevos laterales con el CSS real, no partida real de 1.1.1.

## 2026-10-07 · Interfaz 1.1.0 · Controles agrupados y marco metálico

- Coordenadas, vida, pociones, skills, menús, maná y stamina/AG forman un bloque central compacto. Los orbes quedan a 13/15 px virtuales de los controles; sus indicadores conservan los nodos nativos.
- Textura metálica generada con imagegen, repetida en los laterales e incorporada como WebP en el userscript. Sin descargas externas en el juego.
- Margen reservado para el botón del chat también en viewport angosto. Pruebas de proximidad de orbes y coordenadas fuera de los primeros 56 px, además de regresiones anteriores.
- La captura del usuario confirma la presentación instalada de 1.0.0; 1.1.0 sigue validada en demo, pendiente de partida real.

## 2026-10-07 · Interfaz 1.0.0 · Barra clásica adaptable

- Nuevo userscript independiente: elimina dragones, extiende el fondo al ancho disponible y conserva orbes, pociones, skills, coordenadas, AG, EXP y menús originales.
- Conserva escala nativa cuando cabe, reduce proporcionalmente en anchos pequeños y distribuye el selector largo de skills en filas. Sin comandos ni cambios de almacenamiento/contrato.
- Demo sin cuenta: geometría entre 360 y 1920 px, handlers originales, actualizaciones de fill/números, montaje tardío y reversión. Gráficos ilustrativos; partida real pendiente.
- Gestor de releases admite módulo interface y rollback de conjuntos anteriores sin él.

## 2026-10-07 · Analytics 1.1.2 · Segundo plano

- Alt+Tab y pestaña oculta ya no interrumpen. Se tolera throttling de intervalos sin extender los cinco minutos ni contar ganancias posteriores al plazo.
- Cambio de visibilidad actualiza estado y cierre pendiente; se conservan cortes por muerte, desconexión, mapa, radio, reset y Golden hunt.
- Pruebas de visibilidad simulada e intervalos retrasados sin cuenta real. No fuerza ejecución del juego si el navegador lo suspende.

## 2026-10-07 · Analytics 1.1.1 · Foco de ventana flotante

- Los botones −/＋ y X de EXP por spot no capturan foco al pulsarlos con mouse y liberan foco residual propio. Enter no repite minimizar/restaurar/cerrar.
- Se conserva la activación deliberada por teclado y la medición continúa al minimizar o cerrar. Regresión UI específica en demo.

## 2026-10-07 · Helper 1.15.4 / Radar 1.8.1 · Arena y tracking persistente

- Corregido catálogo del cliente desplegado: Arena 2 usa mapa 83, Arena 3 usa 84 y Arena 4 usa 85. La precarga reconoce cada variante sin depender de un traslado iniciado por el addon. Estar ya en el destino permite caminar al spot directamente; una llegada a otro mapa no confirma el traslado.
- Sustituye la suposición de Arena compartida y la aceptación de destinos arbitrarios de Helper 1.15.3. Reproducido con el instalable anterior: mapa 85 devuelve Lorencia y X/Y vacíos. El cliente público enumera WD_83ARENA2, WD_84ARENA3 y WD_85ARENA4 y comparte únicamente los assets de Stadium.
- White Wizard y Red Dragon persisten por separado en mu.golden-radar.settings.v1; demo usa mu.golden-radar.demo-settings.v1. Guardar confirma, Cancelar descarta y rollback restaura también el almacenamiento. Sin Config, los switches se guardan al cambiar. Historial y posición mantienen sus claves; tracking de dorados conserva su comportamiento por sesión. Preferencias inválidas se preservan; fallo de almacenamiento no se presenta como éxito.
- Pruebas con IDs reales del catálogo, precarga después de viaje manual, reload de tracking y rollback. Sin instalar scripts ni modificar la partida real.

## 2026-10-07 · Helper 1.15.3 · Llegada de Arena y precarga

- Arena 2/3/4 aceptan el mapa informado por una nueva confirmación MapChanged/075 del servidor en lugar de exigir siempre el ID 6. Esperan que el cliente haya cargado ese destino antes de caminar al spot. Se conservan comandos explícitos y timeout; el aviso incluye mapa actual y esperado si la llegada no se confirma. La espera se cuenta desde el envío efectivo, después de detener Home.
- Agregar mapa en Leveleo precarga mapa base reconocido, nivel actual y casilla X/Y al hacer clic. Los campos siguen editables; Guardar aplica y Cancelar descarta. Sin personaje/mapa reconocido conserva entrada manual; niveles inválidos o fuera de orden requieren corrección.
- Regresiones de las tres Arenas con destino de servidor distinto, movimiento antes de Home, precarga y transacciones. La discrepancia del ID en la partida real es una hipótesis; demos sin cuenta no confirman la solución en el juego.

## 2026-10-07 · Config 1.1.1 · Foco de cabecera

- Abrir Config con mouse ya no enfoca automáticamente Cerrar. Minimizar/restaurar y cerrar con pointer no dejan sus botones enfocados, evitando repetirlos al pulsar Enter.
- Se conserva activación y foco deliberados por teclado; cambios limitados a presentación. Regresión en la demo sin cuenta real.

## 2026-10-07 · Analytics 1.1.0 y HUB 1.4.3

- Cambios de party ya no interrumpen mediciones; registro de tamaños observados y cambios, conservando historial anterior.
- Tabla de EXP recibida por mob: muestras, promedio, mínimo y máximo, separada por nivel y cantidad de integrantes. Mob no identificado conserva ganancias sin atribución inventada; no se presenta como EXP base.
- HUB mantiene minimizar al extremo derecho, después de Analytics y otros módulos.
- Pruebas de lógica, demo y release conjunta; partida real pendiente.

## 2026-10-07 · Analytics 1.0.0

- Nuevo módulo independiente: ventana flotante arrastrable y minimizable, medición manual de 5 minutos, EXP/min y EXP/h proyectada, ranking por contexto y exportación JSON.
- Ganancias confirmadas desde experienceGained; interrupciones conservadas fuera del ranking. Historial y posición con claves propias y demo separada.
- Release y rollback incorporan el quinto módulo y conservan conjuntos antiguos. Verificación con demos sin cuenta; partida real pendiente.

## 2026-10-07 · Helper 1.15.2 · Teleports de Arena

- Arena 2, 3 y 4 usan siempre `/move arena2`, `/move arena3` y `/move arena4`, sin priorizar los índices de M. Al iniciar en Arena también envía el teleport de la variante elegida y espera una nueva confirmación de llegada.
- Regresión local de comandos y llegada para las tres variantes. Sin validación en partida real.

## 2026-10-07 · Radar 1.8.0 · White Wizard Corps y Red Dragon

- Dos checkboxes independientes en Config → Radar, apagados al iniciar; Guardar aplica y Cancelar descarta. White Wizard y acompañantes (135–137) en blanco; Red Dragon (42) en rojo, separado de Golden Dragon (44). Preferencias por sesión.
- Detecciones y rastros recibidos por el cliente, con coordenadas y controles existentes de muerte/alcance/caducidad. Historial y Golden hunt conservan únicamente dorados. Mismo tick, sin comandos nuevos.
- Catálogo upstream verificado y pruebas locales; falta confirmar detección en partida real.

# Changelog

## 2026-10-07 · HUB 1.4.2 · Foco después de clics

- Los botones de la barra ya no capturan el foco al usarlos con mouse/touch. Al cerrar Config abierta con mouse, el foco no vuelve al engranaje; Enter queda disponible para el juego y no repite la acción anterior.
- Se conserva el foco deliberado por teclado: Tab y Enter siguen operando los botones, y Config mantiene el retorno de foco en esa modalidad. Los campos de configuración siguen editables.
- Regresión local del engranaje al cerrar Config, controles de barra, Enter recibido por el juego simulado, escritura, edición/Cancelar y navegación por teclado. No se modifican motores ni contrato.

## 2026-10-07 · Helper 1.15.1 / Radar 1.7.1 / HUB 1.4.1 · Invasión ya iniciada

- Radar reconoce el HUD activo y su tooltip de cantidades aunque los avisos/paquetes hayan llegado antes de cargar el addon. Recupera estado actual y mapas sin hover; no renueva artificialmente la antigüedad de cantidades idénticas. El cambio a countdown cierra el evento y una invasión posterior conserva identidad propia.
- G con Play apagado muestra «Encendé Play para cazar goldens». Con Play encendido informa espera de personaje, carga, reset, buff o próxima invasión en vez de usar un texto fijo para todos los casos. HUB solo presenta el estado del motor.
- Noria se puede agregar a Goldens (mínimo 10), sin cambiar rutas guardadas ni habilitar mapas excluidos. Predeterminado conserva los cinco destinos existentes. Centro de gate upstream 174/112; llegada confirmada por MapChanged al mapa 3.
- Regresión local con invasión activa «1 left», sin paquetes de inicio, Play apagado/encendido, destino Noria y eventos consecutivos. Sin acceso a cuenta real.

## 2026-10-07 · Helper 1.15.0 / Radar 1.7.0 · Goldens y Soul Shield

- Nueva pestaña Goldens: ruta ordenable de los cinco destinos existentes, mínimo por fila y habilitación independiente. Checkboxes para anticipación, mapas pendientes, patrulla, captura/uso de spots y Kundun; ajustes en preferencias v1, con borrador y rollback existentes.
- Play controla leveleo, cacería y Soul Shield. G queda armado esperando evento y requiere Play; pausar limpia las acciones propias. La ruta se captura por evento y se revalida el nivel antes de cada traslado.
- Radar lee la cuenta regresiva del HUD y el paquete InvasionMonsters verificado en el cliente desplegado. Identidad continua entre preparación e inicio; cantidades por mapa vencen después de 60 segundos y solo valen para su evento. Mapa desconocido no se considera vacío; Kundun pendiente conserva prioridad.
- Leveleo incorpora Mantener Soul Shield: skill 16 / efecto 4, lanzamiento propio con confirmación, restauración de skill anterior y reintento espaciado. Home conserva sus buffs configurados; skill ausente, recursos insuficientes o timeout avisan y permiten continuar.
- Captura de spots desactivable sin borrar historial; la exploración nunca genera avistamientos. Validación local con pruebas de lógica, diez suites de interfaz y capturas. No confirma funcionamiento en partida real.

## 2026-10-07 · Radar 1.6.0 / HUB 1.4.0 · Mapa flotante

- Mapa separado de la barra de botones y mensaje. Botón Mapa muestra/oculta sin detener captura; minimizar HUB conserva el mapa. Historial vuelve a mostrarlo.
- Candado propio, arrastre por cabecera, posición y bloqueo persistentes en la clave v1 existente. Se mantiene el host y motor original. Helper conserva 1.14.1 y su corrección de Play.
- Validación en demos de controles, orden de carga, posición, bloqueo, teclado y viewport; partida real no verificada.

## 2026-10-07 · Helper 1.14.1 · Play independiente del conflicto de loot

- Los filtros de recogida de Home o su configuración todavía pendiente ya no detienen Play ni el leveleo. El aviso queda en Obtener y suspende únicamente el picker del addon hasta resolver el conflicto, sin reescribir Home.
- Regresión en demo para ambos casos: Play permanece activo y el addon no envía recogidas. Validación local; partida real no verificada.

## 2026-10-07 · Helper 1.14.0 · Reset opcional y cuatro pestañas

- Leveleo agrega «Reset automático al nivel 400». Activado por defecto; conserva la preferencia autoReset en la misma clave v1. Apagado continúa leveleando sin /reset. Desactivar cancela una solicitud en cola aún no enviada; un reset ya enviado continúa esperando confirmación.
- Party y Visualización pasan a pestañas, junto a Leveleo y Obtener. Navegación con flechas/Home/End para las cuatro, borradores conservados y distribución en dos columnas dentro del viewport.
- «Ocultar casco» es un checkbox: marcado oculta, desmarcado muestra. Conserva comportamiento local por sesión, Guardar/Cancelar y rollback. Solo Helper requiere actualización; Config, HUB y Radar conservan versiones.
- Validación de lógica e interfaz en demos; ejecución real no verificada.

## 2026-10-07 · Helper 1.13.1 · Zen sin moverse

- El interruptor Zen pasa a llamarse «Zen sin moverse», conservando la preferencia guardada. Recoge solo en la misma casilla o una adyacente, con el alcance nativo por casillas (incluidas diagonales).
- Usa pickupItemRequest directamente para dinero, sin asignar targets de aproximación ni modificar movimiento/camino. Zen más lejano se ignora incluso con Todo o rango 8. Combate y movimiento manual conservan su comportamiento.
- Mantiene confirmación de dinero, timeout, rechazo y cooldown; no borra un target manual posterior al cancelar una petición directa. Actualizar solamente Helper. Validación en demos; recogida en partida real todavía no verificada.

## 2026-10-07 · Helper 1.13.0 / Config 1.1.0 · Ruta editable y Obtener

- Config se minimiza a una barra arrastrable de 230 px y se restaura sin guardar, cancelar ni reiniciar el borrador. Mantiene foco, Escape y viewport; ajusta posición al cambiar el tamaño del contenido.
- Leveleo permite entre 1 y 26 pasos con selector de los 26 destinos de la captura de M, X/Y y nivel de entrada. Elegir destino precarga el mínimo; se permite subirlo hasta 399. Botones +, quitar y subir/bajar; los niveles deben crecer en el orden elegido. Se conservan spots y preferencias v1 anteriores. Debajo del primer mínimo permanece en el mapa inicial; reset reevalúa la ruta.
- Traslados de rutas nuevas usan `Store.warpCommandRequest` con el índice de M cuando está disponible y el comando como alternativa. Variantes que comparten mapa esperan una nueva confirmación MapChanged. Stadium queda como alternativa solamente de Arena base.
- Pestaña Obtener con activación, rango 1–8, Todo, Jewels/Gems, Zen, Ancient, Excellent y nombres con Agregar/Quitar línea. Categorías OR y requisitos Excellent/Luck AND en los nombres. Lista antigua conserva ambas condiciones; party/apariencia se pliegan.
- Picker dentro del scheduler existente, suspendido durante Golden hunt/traslados/pausa/muerte. Todos los filtros nativos de recogida de Home deben estar apagados para el nuevo modo; conflicto pausa el ciclo sin reescribir Home. Skills, buffs y pociones continúan nativos. Zen confirma con InventoryMoneyUpdate; equipo con respuesta de inventario. Se conservan rechazo/timeout y la limitación de asociación sin ID del drop.
- Actualizar Helper y Config desde dist. Nueve suites UI y lógica en demos; no confirma ejecución en partida real ni instala scripts en el navegador.

## 2026-10-05 · Helper 1.12.0 · Excellent + Luck por nombre

- Interruptor «Loot de Excellent + Luck» y lista de nombres, uno por línea, en Config y en el panel standalone. Coincidencia parcial sin distinguir mayúsculas; exige Excellent y Luck reales. Apagado y vacío por defecto; Guardar/Cancelar, rollback y persistencia compatibles con preferencias v1.
- Pickup desde el scheduler existente durante leveleo en el spot, dentro del radio y rango de Home. Un target pendiente, confirmación por inventario y espera de un minuto tras rechazo/timeout. Pausa, muerte, cambio de mapa y Golden hunt cancelan el pickup propio; Kundun sigue independiente.
- Home combina filtros con OR. Con esta función configurada, el ciclo pausa ante Todo, Excellent, Ancient o nombres adicionales nativos y muestra qué desactivar. No cambia la configuración de Home ni bloquea loot manual; Zen/jewels siguen nativos.
- Solo Helper requiere actualización. Pruebas de lógica y ocho suites de interfaz en demos; comportamiento en partida real todavía no verificado.

## 2026-10-05 · Helper 1.11.2 · Auto party nativo

- Reemplaza Aceptar invitaciones por Auto party usando `/autoparty on|off`; elimina respuestas directas a solicitudes.
- Aplica al ingresar/reconectar y después de guardar, incluso con el ciclo pausado; evita repetir comandos en cada tick o warp y reintenta envíos rechazados con espera.
- Conserva `acceptParty`, almacenamiento y contrato v1. Envío y expulsiones mantienen su comportamiento. Config/HUB/Radar no requieren actualización.
- Priorizar comandos oficiales del juego para automatizaciones. Validación en demos sin cuenta real.


## 2026-10-04 · Helper 1.11.1 · Mapas opcionales

- Interruptores independientes Usar Arena / Usar Icarus dentro de los spots, guardados con las coordenadas. Lorencia queda como base cuando no hay destino habilitado por nivel.
- La búsqueda de Lorencia funciona también a nivel alto si se elige permanecer allí. Al guardar durante el ciclo recalcula la ruta; Golden hunt aplica la selección al retomar leveleo.
- Config/HUB/Radar no requieren actualización. Preferencias anteriores mantienen ambos mapas activos; misma clave y contrato v1.


## 2026-10-04 · Config 1.0.0 / HUB 1.3.0 / Helper 1.11.0 / Radar 1.5.0

- Cuarto userscript Config con ventana flotante arrastrable, Guardar/Cancelar, validación y rollback de ajustes ante fallas. Radar permanece visible.
- Registro v1 ampliado con capacidades opcionales de vista, acciones y ajustes: módulos nuevos se integran sin listas cerradas en HUB/Config. Motores y datos siguen en sus módulos.
- Spots X/Y por mapa y búsqueda de Lorencia centrada en el spot elegido. Preferencias de envío/aceptación de party independientes y persistentes; apagar envío suspende expulsiones. Mostrar casco por sesión y renombre Trackear dorados sin detener captura.
- Gestor de releases incluye Config y conserva rollback/retención de conjuntos anteriores de tres módulos. Pruebas de lógica, siete suites UI y capturas en demos sin cuenta real.


## 2026-10-04 · Tarkan sin avistamientos · Helper 1.10.3

- Sale de Tarkan hacia Atlans3/Atlans2 tras dos minutos consecutivos sin dorados vivos visibles, desde la llegada confirmada o el último avistamiento. Las marcas históricas/recientes no reinician ese plazo.
- Combate, espera del drop y Kundun pendiente conservan prioridad. La muerte suspende el plazo. Mantiene requisitos de entrada y cinco minutos en otros destinos.
- Conserva cambios preexistentes de Helper, Radar y HUB. Validado sin cuenta real.

## 2026-10-04 · Helper 1.10.2

- Opción «Ocultar mi casco» en configuración, apagada al cargar. Solo omite el modelo del casco propio; conserva inventario, stats, apariencia recibida y efectos generales del equipo.
- Restaura la cabeza de clase si falta, invalida cargas pendientes y vuelve al equipo actual al desactivar. Reconcilia cambios de entidad/modelo desde el refresh existente; suspende en transformaciones y Chaos Castle. Sin cambios de contrato HUB ni storage.
- Verificación con modelos simulados y demo local; apariencia en partida real y versión desplegada todavía no verificadas.

## 2026-10-04 · HUB 1.2.2

- Barra sin título, controles de 30 px y botón minimizar/expandir. Contraer oculta mapa, estado y paneles sin pausar motores. Configuración, party e historial expanden la vista. Conserva área de arrastre.


## 2026-10-04 · Golden hunt reactivo · Radar 1.4.1 / Helper 1.10.1

- Radar comparte live/recent y notifica desde su tick; Helper reevalúa sin esperar su refresh general. Dorados vivos del mapa interrumpen patrulla sin fronteras aproximadas de gates.
- Objetivo estable, prioridad por nivel del catálogo del cliente, chequeo de camino y progreso por acercamiento/paquetes ObjectHit. Conserva castRequest durante el acercamiento nativo.
- Cinco kills propias confirmadas por mapa/evento; no cuenta scope, cajas ni muertes ajenas. Deduplica por entidad/encuentro. Atlans2/3 comparten cuota. Resuelve Kundun pendiente antes de viajar.
- Ruta Tarkan2 → Atlans3 → Atlans2 → Lorencia → Davias, omitiendo destinos de mapas con cuota completa y requisitos inaccesibles. Conserva cinco minutos máximos por destino, aprendizaje de niveles y retorno al leveleo.
- HUB 1.2.1 no requiere cambio. Conserva storage, contrato v1 y timers nativos 16px de Helper 1.9.2. Pruebas en demo sin cuenta real.

## 2026-10-04 · Timers nativos legibles · Helper 1.9.2

- Timers del juego a 16 px, independientes de Interface size; filas de 24 px y ancho suficiente para nombres y tiempos originales. Conserva colores, posición y datos nativos.
- Estilo automático al cargar Helper, incluso con ciclo pausado y al recrearse el HUD. Sin widget, polling ni cambios de almacenamiento o contrato HUB.
- Verificado en demo con escala 80%, cambio de escala, recreación del HUD y recarga; no se instaló en la cuenta real.

## 2026-10-04 · Golden hunt · Helper 1.9.1 / HUB 1.2.1

- Nombre corregido a **Golden hunt** en botones, mensajes, configuración, demo, documentación y nombres de pruebas/archivos de la función.
- Motor interno renombrado a `GoldenHunt`. Comportamiento, contrato v1 y claves de almacenamiento conservados para mantener niveles aprendidos. Radar permanece en 1.4.0.

## 2026-10-04 · Golden hunt · Radar 1.4.0 / Helper 1.9.0 / HUB 1.2.0

- Botón G independiente, apagado al iniciar. Vigila avisos del servidor y Golden Dragon, sin motor ni temporizadores nuevos en HUB.
- Cacería en Tarkan2, Atlans2, Atlans3, Lorencia y Davias: cinco minutos por destino, con prioridad a spots históricos y patrulla transitable. Verifica traslados incluso entre regiones con el mismo ID de mapa.
- Aprende el nivel mínimo explícito de rechazos de `/move`, por servidor, personaje, clase y destino. Omite destinos por debajo del nivel aprendido; no confunde dinero con nivel ni inventa mínimos tras un viaje exitoso.
- Apunta solo a tipos dorados auditados. Recoge Box of Kundun +1–+5 (14/11, nivel interno 8–12) y cuenta únicamente confirmaciones de inventario. Un rechazo o timeout de loot pausa G con explicación.
- Suspende el leveleo sin desactivar su botón; retoma según su estado actual. Cancelación limpia acciones propias; muerte conserva el tiempo restante y desconexión detiene la cacería.
- Contrato v1 ampliado con capacidades opcionales, historial intacto y almacenamiento de niveles separado para demos. Pruebas de lógica y demo integrada de ruta, combate, loot, niveles y reanudación; sin cuenta real.

## 2026-10-04 · Radar 1.3.7

- Retirada la casilla Budge: todos los dorados, incluido Golden Budge Dragon, aparecen siempre en detecciones, avistamientos recientes e historial. Se conservan los datos guardados.

## 2026-10-04 · Organización y publicación local

- Fuentes canónicas por módulo en `src`; demos y capturas separadas.
- Release con validaciones de lógica/interfaz, hashes, bloqueo de concurrencia y promoción con respaldo.
- Rollback por conjunto compatible; retención de vigente más tres anteriores por módulo y protección de los últimos conjuntos.
- Radar **1.3.6** reconcilia el movimiento/posición y altura automática de 1.3.5 con el adaptador HUB de 1.3.4.1. El ajuste al viewport standalone no interviene al estar integrado; la demo usa posición separada.
- Helper **1.8.0** promovido desde su release existente: conserva expulsión de miembros lejanos con límites y verificación de datos, además de ruta, reset, búsqueda en Lorencia y party.
- HUB **1.1.2** conserva configuración sin mapa, paneles exclusivos y posición persistente.
- Duplicados sueltos, servidor viejo, plan inicial completado y capturas obsoletas retirados después de verificar el nuevo conjunto.

Las notas previas están en [histórico anterior a la organización](history-before-organization.md). Ese documento contiene instrucciones y rutas antiguas; para instalar o actualizar usar el README y el procedimiento vigente.
# 2026-10-07 · ZIP para compartir la extensión vigente

- Generador reproducible con extensión e instrucciones, SHA-256 adjunto y sin datos de navegador. `npm run share:extension` empaqueta el release instalado en dist después de verificar sus hashes, sin publicar cambios pendientes de src.
- Release y rollback generan también el ZIP. Se conserva extensión 1.0.0: no se cambian los bytes instalables ni los módulos.


Entrega coordinada 2026-10-08: Helper 1.20.2 (estadísticas C/V + toggles de pasos), extensión 1.0.7; conjunto 2026-10-09T01-18-43-977Z-247c34. 151 pruebas y 18 suites UI aprobadas, hashes y ZIP verificados. Evidencia en artifacts/stats-research/character-info-coordinated-release.json y character-info-final-verification.json. Sin cuenta real, instalación ni publicación web.

Validación de actualización: el paquete transitorio cargado por argumentos del navegador de prueba se descarga al ejecutar runtime.reload y no regresa. La suite comprueba la solicitud nativa y la restauración del panel por separado, con evento simulado. La recarga completa en una instalación habitual de Chrome queda pendiente; no se operó la instalación del usuario.

## Helper 1.23.1 · Salida de zona segura

Play camina al spot guardado antes de activar Home, incluso dentro de la tolerancia de llegada si el personaje todavía está en zona segura. Reaparecer dentro de la ciudad invalida la llegada anterior. Un spot guardado dentro de zona segura informa que hay que corregir sus coordenadas. Verificado con simulaciones locales; partida real pendiente.

El cambio de etapa/reset tiene prioridad sobre Soul Shield y sobre una caminata todavía en cola: cancela el buff propio y reevalúa el destino al alcanzar el umbral. Mantiene la espera de confirmación de Home y de viajes ya enviados. El reporte de no avanzar en partida real requiere contrastar mapa/nivel/configuración y estado; la simulación no confirma su causa concreta.

Un nuevo destino tampoco hereda los cinco segundos de espera del viaje anterior: si sube rápido y cruza otro umbral, solicita el siguiente mapa inmediatamente después de confirmar el anterior. Prueba del scheduler real en demo: salida segura → Home → nivel 50 con buff pendiente → Arena → nivel 170 → Icarus.
## 2026-10-11 · Helper 1.24.3 · invitaciones solo al clan

- Enviar party compara el ID de clan del héroe con el del candidato cercano (`entity.guild.id`). Sin clan o datos válidos no invita; no incluye alianzas ni deduce pertenencia por nombres. Relee los componentes en cada evaluación, sin caché de miembros.
- Etiqueta «Invitar solo al clan». Conserva Play, mapas 6/10, proximidad de dos casillas por eje, liderazgo, cupo, intervalos y expulsiones existentes. Auto party nativo sigue independiente.
- Regresiones locales para clan distinto/desconocido, selección del candidato válido y cambios de clan/personaje/mundo; fixtures de party existentes actualizados. Funcionamiento en partida real pendiente.
- Release local completado: 186 pruebas de lógica y todas las suites de interfaz/paquete; extensión 1.0.25. Instalable Helper idéntico a la fuente. Sin instalación ni publicación web.

## 2026-10-11 · Helper 1.25.1 · party en Arena y Davias

- Invitaciones solo al clan habilitadas también en Arena 2/3/4 (83/84/85) y Davias 1/2/3/4 (ID compartido 2); conserva Arena base e Icarus.
- Conserva distancia, Play, cupo, liderazgo, frecuencia, aceptación nativa y límites de expulsión existentes. Mantiene F10 y mini control de 1.25.0.
- Regresión local de mapas permitidos/excluidos, filtro de clan y expulsiones. Partida real pendiente.
- Release local completado: 187 pruebas de lógica y todas las suites de interfaz y extensión aprobadas; sin instalación en el navegador.

