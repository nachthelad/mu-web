## Helper 1.30.0 · Programación por cuenta

Campo opcional schedule v1 en preferencias y registro operativo separado por mundo/cuenta. El refresh existente evalúa hora IANA Argentina; Play/F10 y paneles comparten inicio/pausa. Restaurar preferencias solo puede iniciar si la programación fue habilitada explícitamente y no hay inhibición vigente; las restantes preferencias siguen sin iniciar Play. Guardar programación actualiza la base de la transacción para conservarse tras Cancelar/rollback. [Diseño, claves, política y límites](daily-schedule.md).

# Configuración de Helper por cuenta

## Diseño y alcance (2026-10-07)

Identidad: `window.__store.username` y el mundo de `accountFor` (`mundo/id-local`), únicamente con socket de juego abierto, sin conexión perdida/offline y UIState Characters/LoadingWorld/World (3/4/5). Nunca leer password ni el almacén de credenciales. El nombre de personaje no identifica la cuenta. El cliente público confirma que LoginResponse Okay pasa a Characters y que loadAccount conserva mundo/cuenta por separado. Evidencia pública: artifacts/interface-research/account-store.ts y wings-layout-current.js. Si estos campos dejan de existir, bloquear acciones y escrituras; no improvisar perfiles por personaje.

Se separa el documento completo de Helper: rutas, reset, party, loot, Soul Shield, Goldens y alas. Los personajes de una cuenta comparten el perfil. El casco continúa por sesión. Radar tracking, posiciones y los historiales de Radar/Analytics permanecen generales. Los niveles de movimiento aprendidos incorporan cuenta a su identidad existente de servidor/personaje/clase.

| Dato persistido | Alcance final | Motivo |
| --- | --- | --- |
| `mu.level-helper.settings.v1` | Heredado, conservado sin escrituras | Recuperación explícita, sin asignación automática |
| `mu.level-helper.settings.v1.account.*` | Mundo y cuenta | Rutas, loot, party, reset, Goldens, Soul Shield y alas propios |
| `mu.gold-hunter.move-levels.v1` | Registro existente, nuevas entradas con cuenta | El requisito aprendido depende también de personaje/clase/servidor; no reutilizar datos de otra cuenta |
| `mu.golden-radar.settings.v1` | General | Filtros de presentación del mapa |
| `mu.golden-radar.sightings.v1` | General | Archivo de puntos geográficos; no migrar ni borrar historial |
| Posiciones de Radar, HUB y Analytics | General | Distribución de ventanas en el mismo dispositivo |
| `mu.analytics.history.v1` | General | Historial ya identifica servidor/personaje/clase; fuera del cambio de preferencias |
| Config e Interface | Sin nuevos ajustes persistidos | Mantienen ventana/presentación existentes |

Las demos usan las variantes `demo-*` de esas claves. Los registros de credenciales del cliente no se leen ni se modifican.

Claves nuevas: `mu.level-helper.settings.v1.account.<mundo/cuenta codificados>`; contenido v1 conservado. La clave global anterior queda intacta, recuperable mediante Importar configuración anterior, con Guardar/Cancelar. Sin perfil se usan defaults, sin importar silenciosamente datos heredados.

Cambiar identidad cancela acciones pendientes, pausa Play y G y restaura preferencias antes de nuevas acciones. Cada transacción conserva identidad y bytes iniciales; guardar verifica ambos y rollback solo revierte sus propios bytes. Web Locks serializa escrituras del mismo perfil entre ventanas. Si el navegador no ofrece Web Locks se rechaza guardar. Config 1.3.0 espera apply/rollback asíncronos; se debe actualizar junto a Helper 1.18.0. Un cambio externo pausa el motor; con borrador abierto se rechaza guardar hasta reabrir. Sin borrador se recarga el perfil. Identidad desconocida no permite Play ni guardar. Party automática y envío de invitaciones requieren Play para perfiles por cuenta; restaurar ajustes no envía comandos.

Demos antiguas sin identidad mantienen su almacenamiento separado para compatibilidad de fixtures; nuevas pruebas usan identidades explícitas y la ruta de producción. No afecta datos reales.

## Plan y aceptación

1. Añadir resolver de identidad y almacenamiento con conflicto optimista; probar estados autenticados, dos cuentas, mismo mundo/personajes y rollback.
2. Integrar al ciclo existente y proveedor transaccional de Helper; mostrar cuenta e importación heredada; cancelar al cambiar identidad y escuchar storage sin agregar motores.
3. Probar cuentas, logout, recarga, importación y concurrencia con Chromium local; adaptar fixture de extensión. Ejecutar validaciones y release local conjunta de Helper y Config.

El aislamiento no modifica login ni permite por sí mismo autenticación simultánea. Sin cuenta real no se confirma comportamiento del servidor. Los cambios de esquema del cliente público necesitan revisión del adaptador.

## Resultado local

Release `2026-10-08T02-39-15-687Z-30286a`: Helper 1.18.0, Config 1.3.0 y extensión 1.0.2. Pasaron 139 pruebas de lógica y las 17 suites de interfaz, incluida extensión Chromium con perfil desechable. Hashes de Helper/Config coinciden entre src, dist y manifest. Validación con reintentos acotados de rename de Windows, sin omitir checks. Log: `artifacts/account-settings-release-final.log`. Captura: `docs/screenshots/account-settings-preview.png`.

Instalación pendiente del usuario: recargar la extensión y la PWA, o reemplazar ambos userscripts desde dist. Entrar a la cuenta, abrir Config, importar la configuración anterior si corresponde y Guardar. Repetir con otra cuenta para sus ajustes propios; Play se inicia manualmente. La instalación habitual y partida real no fueron modificadas ni probadas.
