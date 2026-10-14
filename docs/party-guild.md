# Invitaciones por grupo · Helper 1.28.0

«Invitar solo al clan» conserva sendParty. «Invitar fuera del clan» usa sendPartyOutside, booleano opcional v1, false por ausencia y por defecto. Guardar/Cancelar mantienen el flujo transaccional y la separación por mundo/cuenta. El Centro de control proyecta el mismo formulario. Auto party (acceptParty) sigue independiente.

Ambas opciones exigen 2000 ms de presencia cercana continua **observada por el ciclo existente**, dentro de dos casillas por eje. Se comparan guild.id enteros no negativos de héroe y candidato: igualdad para clan, diferencia para terceros. Sin guild o con dato inválido se excluye al candidato; la falta del componente no prueba ausencia de clan, porque AssignCharacterToGuild llega por separado. No se inventa un indicador de clan conocido ni un plazo que convierta desconocido en tercero. Esto excluye también a jugadores realmente sin clan cuando el cliente solo ofrece ausencia del componente.

El registro usa referencia de entidad y firma de netId/nombre/clan propio/ajeno. Nueva entidad con el mismo nombre/ID reinicia espera. Pérdida de rango/elegibilidad, pausa, desactivación del grupo, cambio de mapa/personaje/cuenta/servidor o desconexión cancelan pendientes. Se observa también durante el cooldown global. Ganan los candidatos maduros con presencia más antigua, luego menor distancia y menor netId. Se conservan 10 s globales y 60 s por nombre y se revisan las condiciones en cada ciclo antes del despacho. No se conoce lo que pasó entre dos observaciones ni se garantiza ejecución en pestañas suspendidas.

partyInvite en el cliente archivado retorna void tras despachar y mostrar el aviso local. Un retorno distinto de false registra el intento a efectos del límite; false o excepción no lo registra. Esto no confirma recepción ni incorporación a party. No se envían solicitudes duplicadas desde dos grupos ni se agrega un scheduler. La aceptación nativa permanece igual. La expulsión sigue gobernada únicamente por sendParty y mapas 6/10, independientemente del clan de los miembros.

Validación: tests/party-delay.test.cjs y regresiones party/config-settings/native-autoparty; config-ui y extension-panel-ui verifican controles y persistencia. Capturas: docs/screenshots/party-delay-standalone.png y party-delay-external.png. Fixtures locales, sin cuenta real; comportamiento en partida real pendiente.

## Antecedente conservado

# Invitaciones solo al clan · Helper 1.25.1

«Invitar solo al clan» conserva la preferencia `sendParty` y solo permite candidatos cuyo `guild.id` coincide exactamente con el componente `guild` del héroe actual. Un ID debe ser entero no negativo; ausencia de componente o ID inválido impide invitar. No se comparan nombres, logos, alianzas ni listas guardadas. La pertenencia se consulta en cada evaluación del motor existente.

La evidencia del cliente público conservada en `artifacts/item-creator-research/layout--UWzP455.js` muestra que `AssignCharacterToGuild` asigna a cada entidad `guild: {id: GuildId, role: Role}`; `GuildMemberLeftGuild` elimina ese componente, y la disolución lo elimina de las entidades afectadas. `artifacts/stats-research/live-boot.js` usa `entity.guild?.id` para listar jugadores cercanos y mostrar su clan. Esta es evidencia de snapshots del cliente, no una confirmación en una partida actual. No fue posible descargar nuevamente el cliente desde la terminal durante este cambio por resolución DNS.

Desde 1.25.1 se permiten Davias 1/2/3/4 (ID compartido 2), Arena base (6), Arena 2/3/4 (83/84/85) e Icarus (10). Se mantienen proximidad de dos casillas por eje, liderazgo, máximo de cinco miembros, pausa y tiempos de espera de 10 segundos globales y 60 segundos por candidato. No cambia la expulsión existente: sigue limitada a los mapas 6/10. Auto party sigue usando `/autoparty on|off` de manera independiente, sin filtrar aceptación por clan. No agrega temporizadores, almacenamiento ni contratos.

Validación local: pruebas de selección de clan, datos ausentes o inválidos, candidato ajeno más cercano, cambios de clan/personaje/mundo y regresiones de límites, cupo, miembros y aceptación nativa. La instalación y verificación en partida real quedan pendientes.

## Entrega local 2026-10-14

Helper 1.28.0, extensión 1.0.31, conjunto 2026-10-14T14-39-08-867Z-9a90eb. Release oficial aprobado: sintaxis, 202 pruebas de lógica y todas las suites de interfaz. Paquete final verificado con los 22 grupos de extension-panel-ui --package dist/chrome-extension; hashes de los seis módulos y los 14 archivos de extensión comprobados. ZIP: dist/mu-web-chrome-1.0.31.zip. SHA-256: 24637fd2188b1b92f178e7edaff7082ce1c22ee749aa627260c615c9ddf44a56. Evidencia: artifacts/party-delay-delivery.json y logs allí referidos. Sin instalación ni cuenta real.
