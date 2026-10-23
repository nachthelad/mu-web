# Cliente Aida y Dark Lord · 22/10/2026

Auditoría de archivos públicos de https://mu.mormon.garden/, sin login, boot del cliente ni comandos al servidor. Evidencia descargada y hashes en `artifacts/client-oct22/audit.json`; extracción reproducible con `node scripts/character-oct22-fixture.cjs`.

La raíz usa `index-D-gOSya0.js`; este entry carga `boot-V1YFbozx.js` y `layout-DCITLqBq.js`. El bloqueo de conexión se reproduce porque el par no estaba autorizado en el adaptador. El módulo conserva `f as n` (store), `K as V` (social) y `x as aw` (event bus), con mundo en `store.world`. El puente sigue importando solo el módulo cacheado y validando sus interfaces, sin otro motor/socket.

Character Info en boot usa `gM` importado como `b1`: `Uxt` calcula con clase, nivel, fuerza, agilidad, vitalidad, energía, liderazgo y equipo. Catálogo `No=bU`, slots `re=aL`, propiedades `Gg=nF`, tooltip `MNt=nH`, nombre `mk=fd`. Los aliases nC/nE anteriores ahora refieren a otras funciones; no son compatibles. Wizardry conserva mano principal 0. Los cierres nativos están en `index-BgnzzAmr.js`, registro `jt` y función `F0`, extraídos junto con MobX para probar coexistencia/restauración C/V.

El enum del cliente identifica `WD_33AIDA=33`, `DarkLord=16` y `LordEmperor=17`. Radar añade el nombre al catálogo común del minimapa y desglose de invasión. En boot, `G8` aplica `trunc(nivel*66/100)` a BaseClass.DarkLord (igual que MG), excepto el nivel 400. Helper aplica los mínimos reducidos ya existentes también a 16/17. No se agregan destinos Aida ni costes/índices de traslado sin catálogo verificado.

Pruebas: fuentes y hashes; cálculo DL con liderazgo, propiedades/tooltip de staff; puente compartido y tardío, interfaces inválidas/desconocidas; estadísticas/A-B, cierres nativos C/V y aislamiento de cuenta/mundo; nombre Aida en UI de Radar. Traducciones, nombres de skills y Ancient settings son scaffolding explícito en las fixtures. La validación local no confirma una partida real ni aceptación del servidor.

Para mu-web-bk: comprobar su allowlist y exports contra este mismo par. No basta con cambiar hashes: los aliases internos también cambiaron. Esta auditoría solo confirma n/V/aw y el adaptador de estadísticas; habilidades, animaciones y Scan necesitan su propia auditoría. Preservar bloqueo seguro de builds desconocidos y arquitectura independiente.

Resultado final: release local 2026-10-22T15-57-07-062Z-b3a595, extensión 1.0.45, Helper 1.31.3 y Radar 1.9.4. Sintaxis, 234/234 pruebas de lógica y todas las suites UI obligatorias aprobadas. Integridad fuente/dist/paquete/ZIP verificada. SHA-256 del ZIP: c6a2ec7199eb13c351f2895a90337329d06f69498ba7aed7aa1bceda6be3ddd7. Raíz y hash del layout público reconsultados sin cambios antes de entregar. Diagnóstico enviado al chat Scan y calibración automática del combo BK; recibido sin cambios ni publicaciones en ese proyecto.
