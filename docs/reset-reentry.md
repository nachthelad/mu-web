# Reingreso después del reset · Helper 1.24.1

## Diagnóstico comprobado localmente

Antes, `Cycle.step` comprobaba 90 segundos desde la creación del reset antes de considerar la selección cargada. Reset en t=0 y siguiente ejecución en t=91000, con conexión y personaje disponibles, detenía Play sin intentar el ingreso. Esto reproduce una falla ante retrasos del scheduler; no demuestra qué ocurrió en la partida real del usuario.

El intervalo existente sigue siendo de 500 ms. No se agrega un scheduler ni se traslada el motor al worker. El presupuesto de espera acumula deltas de reloj no negativos, limitados a 5000 ms por ejecución: los huecos largos aportan una oportunidad acotada, sin consumir toda la espera. A intervalos normales el plazo sigue siendo 30 s sin selección y 90 s para reingreso. Con intervalos demorados se extiende el tiempo de pared, pero consume un presupuesto finito en cada oportunidad. Envío efectivo del comando reinicia el presupuesto, separando la espera de Home de la confirmación del reset.

La lista cargada en UI 3 y conexión válida permiten elegir únicamente el nombre inicial. Se permiten tres solicitudes como máximo, separadas por 10 s de espera observada. UI 4, carga de escena/lista y falta de conexión no habilitan reintentos. Retorno false o excepción de la API detienen Play. Una API void no confirma éxito: se espera UI 5 con personaje listo, mismo nombre y descenso de nivel. No se vuelve a enviar /reset.

## Identidad y cancelación

El flujo autenticado sigue pasando por `syncAccount` antes de `Cycle.step`. Los estados 3/4/5 con socket abierto conservan identidad aun cuando `playerData.name` desaparece temporalmente; ese nombre no define la cuenta. El ciclo captura cuenta y servidor y los verifica también antes de seleccionar.

No hay evidencia suficiente para tratar socket cerrado, UI de login o campos autenticados ausentes como una reconexión confiable. En esos casos se conserva la política segura existente: cancelar Play y pendientes. Una identidad que reaparece no autoriza reanudar; el usuario inicia Play. No se reutiliza una identidad almacenada para enviar solicitudes o guardar ajustes. El fixture antiguo que simula reset pasando por login sin autenticación no demuestra reingreso productivo.

## Validación y límites

`tests/reset-reentry.test.cjs` cubre reloj demorado (91 s y diez minutos), distintos slots, lista demorada, espera finita, tres intentos, carga sin reintentos, confirmación tardía, pausa, cambios de sesión y resets sucesivos.

`tests/reset-reentry-ui.cjs`, incluido en el release oficial, ejecuta el camino de identidad de producción en Chromium aislado: cuenta autenticada, nombre de personaje temporalmente ausente, lista disponible tras salto de reloj, UI 4, confirmación de mundo, rechazo/excepción de API, logout, identidad desconocida, desconexión y cambio de cuenta. Verifica selección exacta, un único /reset y cancelaciones sin reanudación.

Estas pruebas no usan cuenta real ni prueban el servidor. Una pestaña congelada no ejecuta JavaScript; una descartada pierde el documento y requiere inicio manual. Queda pendiente confirmar el próximo reset en partida con el juego en segundo plano.
