# Auditoría local de permisos de creación

Fecha: 2026-10-09. Autorización comunicada por el usuario: capturas del administrador permitiendo scripts para probar vulnerabilidades. Alcance de esta ejecución: lectura de código público y pruebas locales; sin cuentas, conexiones al juego, comandos reales ni creación de ítems.

## Resultado

**No se encontró un bypass de permisos en el camino de chat revisado.** Se ejecutó el archivo original `ChatMessageCommandProcessor.cs` descargado de OpenMU en un proyecto C# aislado con dobles de sesión/plugin/logger. Diez casos pasaron. Esto valida el control de ese procesador con esas entradas; no certifica el servidor actual ni descarta vulnerabilidades en otros componentes.

La revisión upstream consultada es `43ace6dbd6227a210915bdda8abb4e163fea48cd`. El backend efectivo de mu.mormon.garden continúa sin identificar/verificar. Los recursos del cliente público no prueban esa versión del backend.

## Trazado comprobado por lectura

1. `ChatMessageBaseHandlerPlugIn` recibe un `Player` ya asociado al paquete y extrae texto/nombre. No lee de ese paquete un rango administrativo.
2. `ChatMessageAction` selecciona el procesador por prefijo. Aunque advierte una discrepancia entre nombre enviado y personaje, mantiene el mismo `sender`; el nombre no selecciona una sesión GM.
3. `ChatMessageCommandProcessor` resuelve el plugin por la primera palabra y compara `sender.SelectedCharacter.CharacterStatus` con `MinCharacterStatusRequirement` **antes** de llamar al plugin. Plugin inexistente o rango insuficiente retornan.
4. `ItemChatCommandPlugIn` declara requisito GameMaster y construye el drop a partir de definiciones servidor. El rango no forma parte de sus argumentos.
5. `MoveItemAction` obtiene el objeto del storage servidor por slot; `DropItemAction` lo obtiene del inventario servidor; `PickupItemAction` busca un drop existente en el mapa y verifica distancia/propiedad. En estas acciones no se encontró un camino que convierta una edición de `playerData.items` en un ítem servidor. No se auditó exhaustivamente todo el protocolo, plugins o concurrencia.

Fuentes descargadas: `artifacts/item-creator-research/src_GameServer_MessageHandler_ChatMessageBaseHandlerPlugIn.cs`, `src_GameLogic_PlayerActions_Chat_ChatMessageAction.cs`, `src_GameLogic_PlayerActions_Chat_ChatMessageCommandProcessor.cs`, `ItemChatCommandPlugIn.cs` y acciones `Items_*` del mismo directorio. [Código upstream fijado](https://github.com/MUnique/OpenMU/tree/43ace6dbd6227a210915bdda8abb4e163fea48cd/src).

## Prueba reproducible

Proyecto: `artifacts/item-creator-research/permission-harness/PermissionHarness.csproj`.
Resultado: `artifacts/item-creator-research/permission-harness-results.json`.

```powershell
# Con SDK .NET 8 instalado. Sin paquetes externos; NuGet.Config no tiene feeds.
$env:DOTNET_CLI_HOME=Join-Path $PWD 'artifacts/item-creator-research/permission-harness/.dotnet'
$env:DOTNET_CLI_TELEMETRY_OPTOUT='1'
dotnet run --project artifacts/item-creator-research/permission-harness/PermissionHarness.csproj --configuration Release
```

| Caso | Resultado local |
| --- | --- |
| Sesión ordinaria solicita /item | Plugin no llamado |
| Nombre del mensaje dice GameMaster | Plugin no llamado |
| Bandera GM solo del cliente | Plugin no llamado |
| Argumento adicional afirma isGameMaster=true | Plugin no llamado |
| Argumentos con nombre | Plugin no llamado |
| Valores de ítem fuera de rango | Plugin no llamado, bloqueado antes del parser |
| Comando con mayúsculas no resuelto por el doble | Plugin no llamado |
| Comando desconocido | Plugin no llamado |
| Sesión con rango servidor GM | Plugin llamado una vez, control positivo |
| Rango servidor revocado entre llamadas | Segunda llamada bloqueada |

El archivo del procesador se enlaza sin modificaciones. Player, plugin, registro, logger y enum de rangos son dobles mínimos; la bandera local es un campo de prueba ajeno al procesador. La prueba no ejecuta el plugin de creación, parsing completo, selección de personaje, persistencia ni handlers de red. Mayúsculas/comandos desconocidos comprueban la rama de plugin ausente usando un resolver de prueba exacto; no afirman que el registro real sea sensible a mayúsculas. No es una instancia completa de OpenMU.

## Observaciones que no acreditan escalamiento

- La comprobación de rango está en el procesador, no se repite en `ChatCommandPlugInBase.HandleCommandAsync`. Un llamador alternativo debería comprobar autorización; no se identificó uno accesible al jugador que evada este procesador. Es una cuestión de defensa en profundidad, no una vulnerabilidad demostrada.
- El comando GM valida grupo/número y nivel, pero no todas las combinaciones: Luck usa `First` y puede lanzar si falta la opción; Opt asigna el nivel indicado sin un límite específico en ese método; Excellent selecciona los bits definidos sin aplicar el límite de generación aleatoria. La base captura excepciones. Son observaciones de robustez de una función ya privilegiada; no permiten que un usuario común llegue a ella.
- Mostrar el panel GM, modificar el inventario cliente o serializar un objeto no otorga rango ni acredita persistencia. Un timeout o ausencia de rechazo visible tampoco significa éxito.

## Próximo paso útil

Solicitar al administrador la revisión y configuración efectiva del backend, y preferentemente un entorno desechable con usuario normal/GM de prueba y registros servidor. Ahí se podrá comprobar el recorrido completo y los plugins particulares, manteniendo las pruebas fuera de cuentas reales. No hace falta compartir credenciales por este chat.

La creación real sigue bloqueada por falta de mecanismo accesible confirmado. No se añadió un override, formulario de creación ni simulación sustitutiva. No se modificaron src, dist, releases, almacenamiento o instalación del navegador; no corresponde una release de producto. Se preservaron los cambios locales ajenos.
