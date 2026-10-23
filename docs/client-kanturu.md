# Cliente Kanturu y Fenrir · 22/10/2026

Auditoría estática de archivos públicos, sin boot del juego, autenticación de juego ni comandos al servidor. El anuncio oficial de Kanturu/Fenrir y minimapa se leyó en Discord, mensaje `1562902724247560304`; la raíz pública permite comprobar el cambio independientemente del anuncio.

`index-C5JIMxmo.js` carga `layout-A1P3A0u1.js` y `boot-BJb3X1Q4.js`. El puente anterior rechaza esta entrada como no compatible; se reprodujo en la suite aislada antes del arreglo. Los singletons conservan `f=n`, `K=V`, `x=aw` y `store.world`. Se añade el par explícito sin relajar validaciones ni importar otro motor.

Character Info importa `b1 as FM` y lo invoca con clase, nivel, atributos, liderazgo y equipo. El export real es `U5t=b1`; catálogo `No=bU`, slots `re=aL`, propiedades `Gg=nF`, tooltip `MNt=nH`. Nombre es ahora `mk=fg`; `fd=EJe` es otra función. La fixture nueva verifica nombres de Fenrir y métricas/tooltip de staff con los cuerpos extraídos.

El registro nativo de ventanas pasó a `Ot/Z0` en `index-CSWR8x1U.js`, con nuevos aliases y ventana de mascotas. La extracción reproduce exclusividad original antes de probar el hook de coexistencia C/V existente. Las suites comprueban ambos órdenes, Escape, escritura, apagado/restauración, A/B, recreación de C e identidad de cuenta/mundo, sin iniciar Play.

Radar usa su propio canvas y no selecciona clases del minimapa nativo; Helper/Interface tampoco parchean su DOM. La actualización nativa no justifica cambios por semejanza ni nuevas rutas de leveleo. No se verificó visualmente el solapamiento con el juego real.

Fuentes públicas y SHA-256 en `artifacts/client-kanturu/audit.json`; extracción reproducible con `node scripts/character-kanturu-fixture.cjs`. Traducciones, Ancient settings, nombres de skills y UI ajena a C/V son scaffolding explícito. La simulación no confirma funcionamiento en partida real.

BK requiere su propia auditoría de selección, usabilidad y SkillAnimation; no hereda la allowlist de este proyecto.

Resultado: release local `2026-10-22T21-59-39-503Z-0ec3c2`, extensión **1.0.46** / Helper **1.31.4**. Sintaxis, **237/237 pruebas de lógica** y todas las suites UI obligatorias aprobadas. BK independiente **0.1.8**, **57/57 pruebas de lógica**, build y validación de paquete en Chromium con red real bloqueada aprobados. La etiqueta de consola del validador BK conserva el texto histórico 0.1.7; fuente, manifiesto, package.json y ZIP son 0.1.8 y se comprobaron por separado.

SHA-256 ZIP mu-web: `9458dd5f13e081b7ac3b4b5a4a97a4795f20dbd13aa619b7e85a4d0f6bc7082d`. ZIP BK: `8f4aae07652612f4b60c5c6ac1d9a839dcbcba983ae580cceef1f5ae2d8bfed7`. Fuente/paquete y checksums comprobados; raíz y layout públicos reconsultados sin cambios a las 22:00:55 UTC. Ver `artifacts/client-kanturu/verification.json`. Revisión independiente sin hallazgos funcionales. Sin instalación, push ni publicación web; partida real pendiente.
