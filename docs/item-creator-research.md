# Creador de anillos y pendants: investigación

Fecha: 2026-10-09. Resultado: implementación bloqueada por falta de evidencia de habilitación y permisos en el servidor actual. No equivale a afirmar que el servidor carece de creación administrativa.

Continuación autorizada: [auditoría local del control de permisos](item-creator-permission-audit.md), con diez casos ejecutados sobre el procesador upstream original y dobles locales. No se encontró bypass en ese recorrido; backend real pendiente.

Se leyeron AGENTS, README, organización, contrato de addons, documentación de loot, alas y estadísticas, y las fuentes relacionadas. Se conservaron los cambios locales previos. Solo se descargaron recursos públicos; no se abrió una sesión, usó una cuenta, envió un comando ni creó un ítem. No se implementó una simulación sustitutiva, ni se cambiaron fuentes publicadas o distribuciones.

## Evidencia y alcance

Capturas estáticas en `artifacts/item-creator-research/`, con hashes en `evidence-sha256.json`:

- La raíz pública de https://mu.mormon.garden/ referencia `assets/index-DQoUdcHM.js`; sus dependencias incluyen `boot-BuVoDwBX.js` y `layout--UWzP455.js`. Se descargaron directamente del origen, sin ejecutar el juego.
- El boot publicado contiene una acción que llama `G.run(ue("/item"),Gk(...))`; Gk traduce selección a `group`, `number`, `lvl`, `ex`, `sk`, `lu`, `opt`, `anc`. Hay código de panel GM y selector de ítems. Esto demuestra presencia de interfaz cliente, no habilitación del plugin servidor.
- [Cliente upstream](https://github.com/Ignies/OpenMu-Client-Babylon/tree/41147b8171fae04825eb6ad59b0b6a973cf928f3), revisión consultada: `gmPanel.ts` permite el panel cuando `Store.playerData.isGameMaster || Store.isOffline`; usa chat ordinario mediante `Social.sendChat`. Offline no tiene socket. Su catálogo de comandos es estático; no acredita comandos concedidos por el servidor actual.
- [ItemChatCommandPlugIn.cs](https://github.com/MUnique/OpenMU/blob/43ace6dbd6227a210915bdda8abb4e163fea48cd/src/GameLogic/PlugIns/ChatCommands/ItemChatCommandPlugIn.cs) exige `CharacterStatus.GameMaster`. Busca grupo/número en la configuración del servidor y limita nivel al máximo del ítem. Crea un `TemporaryItem`, lo añade como `DroppedItem` al mapa cerca del GM y emite `ItemCreatedResult`. No lo inserta directamente en inventario.
- [Procesador de chat](https://github.com/MUnique/OpenMU/blob/43ace6dbd6227a210915bdda8abb4e163fea48cd/src/GameLogic/PlayerActions/Chat/ChatMessageCommandProcessor.cs) comprueba plugin y rango en el servidor; ante rango insuficiente retorna sin respuesta al jugador. Un silencio puede ser falta de permiso, comando ausente o timeout: no permite distinguirlos.
- OpenMU dispone de AdminPanel según su documentación upstream. No se verificó una instalación administrativa accesible de este servidor ni credenciales/autorización. No se sondearon endpoints privados.

El nombre TemporaryItem en código servidor no significa un objeto visual del navegador: aquí participa en un drop del mapa del servidor. Tampoco prueba persistencia en inventario/base de datos. La confirmación de drop y la posterior adquisición/persistencia son etapas distintas. Cambiar `playerData.items`, serializar bytes o reemplazar un modelo local no satisface el objetivo.

## Catálogo cliente comprobado

Extraído del layout desplegado, grupo **13**. La extracción completa conserva campos originales en `deployed-jewelery-catalog.json`. Son definiciones cliente; no una lista certificada de creación permitida por el backend.

| Tipo ordinario | Número | Nombre cliente | Familia Excellent según inicializador upstream |
| --- | --- | --- | --- |
| Anillo | 8 | Ring of Ice | Defensa |
| Anillo | 9 | Ring of Poison | Defensa |
| Anillo | 21 | Ring of Fire | Defensa |
| Anillo | 22 | Ring of Earth | Defensa |
| Anillo | 23 | Ring of Wind | Defensa |
| Anillo | 24 | Ring of Magic | Defensa |
| Pendant | 12 | Pendant of Lightning | Wizardry |
| Pendant | 13 | Pendant of Fire | Física |
| Pendant | 25 | Pendant of Ice | Wizardry |
| Pendant | 26 | Pendant of Wind | Física |
| Pendant | 27 | Pendant of Water | Wizardry |
| Pendant | 28 | Pendant of Ability | Física |

Otros registros cliente, sin asumir Excellent: 13/10 Ring of Transformation; 13/20 Ring of Wizard; 13/38 Moon Stone Ring; 13/39 Elite Skeleton Warrior Ring; 13/40 Jack O'Lantern Ring; 13/41 Christmas Ring; 13/42 Gm Ring; 13/68 Snowman Ring; 13/76 Panda Ring transformation; 13/122 Skeleton Transformation Ring. No incluirlos como joyería ordinaria sin validar sus reglas particulares. Discrepancia explícita: upstream llama MoonstonePendant a 13/38, pero lo asigna al slot de anillo; el cliente publicado dice Moon Stone Ring. No inventar equivalencia de tipo.

## Opciones: comprobación upstream, pendiente de configuración real

La extracción por slots 9/10 devuelve 25 registros: además de los 22 anillos/pendants nombrados arriba, incluye 13/43 Tensile of Increase, 13/44 Tensile of Abundance y 13/45 Tensile of Maintenance. Compartir slot no prueba que sean variantes de anillo con opciones Excellent; quedan fuera del catálogo ordinario propuesto.

Fuentes: [Jewelery S6](https://github.com/MUnique/OpenMU/blob/43ace6dbd6227a210915bdda8abb4e163fea48cd/src/Persistence/Initialization/VersionSeasonSix/Items/Jewelery.cs), sus bases Version095d/Version075 y [ExcellentOptions](https://github.com/MUnique/OpenMU/blob/43ace6dbd6227a210915bdda8abb4e163fea48cd/src/Persistence/Initialization/Items/ExcellentOptions.cs). La asociación está declarada para joyería, no extrapolada por semejanza con armas o armaduras.

| Bit / máscara | Anillos ordinarios | Pendants ordinarios |
| --- | --- | --- |
| 0 / 1 | Zen ×1,4 | Mana tras kill: multiplicador 1/8 |
| 1 / 2 | DefenseRatePvm ×1,1 | Vida tras kill: multiplicador 1/8 |
| 2 / 4 | Reflexión 5% | AttackSpeedAny +7 |
| 3 / 8 | ArmorDamageDecrease 4% | Daño base físico o wizardry ×1,02, según variante |
| 4 / 16 | Mana máxima ×1,04 | Daño base físico o wizardry: TotalLevel /20 |
| 5 / 32 | Vida máxima ×1,04 | ExcellentDamageChance +10 puntos porcentuales |

`ex` combina bits por OR (0–63). El serializador cliente también usa máscara 0x3f: esto representa datos, no concede opciones. El inicializador limita la generación aleatoria a dos Excellent; el comando GM recorre todos los bits definidos y no aplica ese límite de dos. No trasladar automáticamente una restricción de drops aleatorios al comando, ni asumir que el servidor actual permite seis.

En las bases upstream, joyería ordinaria tiene nivel de ítem 0–4 y opción normal 0–3; resistencia por nivel definida por tabla 0–4. La opción normal aumenta HealthRecoveryMultiplier 1% por nivel salvo 13/24 (MaximumMana) y 13/28 (MaximumAbility), definidos por S6 con incremento multiplicativo 1% por nivel. Los campos Lvl del catálogo cliente no son un máximo de mejora. El formulario GM genérico admite valores más amplios y no es un validador específico de joyería.

No hay definición Luck ni Skill para estas variantes ordinarias en los inicializadores revisados. No ofrecer Luck, Skill, Ancient, Harmony o sockets sin definición específica y evidencia del mecanismo. El comando no es un validador completo: Luck busca una opción existente con First y puede fallar si no existe; Excellent ignora bits sin opción definida; Opt no valida aquí todo el rango de la definición. La validación del futuro addon debe ser estricta y no depender de esos comportamientos.

[Argumentos upstream](https://github.com/MUnique/OpenMU/blob/43ace6dbd6227a210915bdda8abb4e163fea48cd/src/GameLogic/PlugIns/ChatCommands/Arguments/ItemChatCommandArgs.cs): grupo byte, número short; lvl/ex/opt byte; sk/lu booleanos; anc 0/1/2, ancBonuslvl 1/2. Esos rangos de transporte son más amplios que los atributos válidos del ítem. No se verificaron costos, cuotas, cooldown administrativo, combinaciones Ancient ni modificaciones propias de este servidor.

## Bloqueos y evidencia necesaria

1. Confirmación del operador de que `/item` está instalado/habilitado y documentación o export de su versión/configuración efectiva. El cliente público puede conectarse a diferentes servidores; una interfaz compilada no certifica su backend.
2. Confirmación de rango GM/autorización disponible. No se verificó ninguna cuenta y no se asumirá ni modificará `isGameMaster` para habilitarlo.
3. Catálogo/opciones de configuración servidor para estos IDs, máximos y combinaciones. Los datos upstream son una referencia contrastable, no sustituyen esa configuración.
4. Evidencia administrativa o de un entorno de pruebas autorizado que permita asociar solicitud con respuesta, drop y persistencia. El chat y las actualizaciones de inventario no ofrecen por sí solos una correlación inequívoca. No hacer esta prueba en una cuenta real durante este encargo.

No hay por ahora un mecanismo **verificado y accesible** que permita cumplir creación persistente. Se detiene antes de implementar, como exige el alcance. No corresponde generar release, paquete nuevo ni captura de una interfaz inexistente.

## Plan condicionado y ubicación propuesta

- Obtener la evidencia anterior. Si confirma acceso, implementar un módulo independiente en src con botón «Ítems» compacto en `capabilities.actions` de HUB y ventana propia; HUB solo monta el host, sin motores. Formulario transitorio, sin credenciales ni persistencia adicional.
- Resolver catálogo y reglas exclusivamente para el mecanismo confirmado; seleccionar tipo/variante/opciones, mostrar resumen y una acción explícita. Editar no envía. Una solicitud en curso bloquea doble envío; cambios de identidad/desconexión invalidan su asociación. Timeout informa resultado desconocido y no reintenta.
- Validar exclusivamente con demos: IDs/bits/rangos/combinaciones, resumen, cero envíos al editar, un envío por acción, permisos/rechazo/timeout/confirmación simulados, invalidación de sesión, teclado y viewport compacto. La demo no certifica persistencia real.
- Solo tras implementar: versiones/changelog/docs, release local validado, instalables/ZIP y captura. No instalar ni publicar.

Alternativas sujetas a elección del usuario: vista previa sin creación, o generador de comandos para revisión de un administrador. Ninguna se implementó como sustituto del objetivo original.
