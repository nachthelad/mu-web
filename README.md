# MU · Radar, Helper y HUB

Tres userscripts independientes para https://mu.mormon.garden/.

## Instalar y actualizar

Instalá un script separado en Tampermonkey por cada archivo de `dist`: `golden-radar.user.js`, `level-helper.user.js` y `hub.user.js`. Para actualizar, reemplazá **todo** el contenido del mismo script, guardá y recargá el juego cuando puedas interrumpir la partida. Conservá un solo script activo por módulo. El orden de carga es independiente.

Las versiones y hashes vigentes están en [dist/manifest.json](dist/manifest.json). Los archivos de `dist` están listos para instalar; los de `src` son la fuente de desarrollo. No hay actualización automática por URL.

- **Radar 1.3.6:** detecciones recibidas, historial local, movimiento y posición persistente; funciona solo o dentro de HUB. No confirma spawns reales ni detecta fuera del alcance del cliente.
- **Helper 1.8.0:** ciclo Lorencia/Arena/Icarus, reset, reingreso y party automática. Usa el MU Helper nativo; configurá skills y pociones previamente en el juego. Play/pause controla el ciclo, la party sigue activa.
- **HUB 1.1.2:** presentación integrada, posición bloqueable, paneles separados; oculta el mapa mientras abre configuración. No duplica motores ni envía comandos por su cuenta.

El historial permanece en `localStorage` del origen del juego, clave `mu.golden-radar.sightings.v1`; exportalo desde Radar antes de migraciones de datos. Las posiciones usan `mu.golden-radar.position.v1` y `mu.hub.position.v1`. Las demos usan claves aparte. Los respaldos de código no incluyen datos del navegador.

## Desarrollo

```text
npm run dev
npm run check
npm test
npm run test:ui
npm run release
npm run release -- --module helper
npm run rollback -- --set <id>
```

`dev` sirve solo en http://127.0.0.1:4173/. La portada es la demo integrada; `/preview.html`, `/helper-preview.html` y `/hub-preview.html` conservan acceso a las demos. Ctrl+C detiene el servidor. No usa cuenta ni servidor del juego.

Las pruebas de interfaz requieren Playwright y Chromium. En Codex se usa el runtime local disponible; fuera de Codex, ejecutá `npm install` y `npx playwright install chromium`. No hace falta instalar dependencias para usar los userscripts en el navegador.

`release` ejecuta sintaxis, pruebas de lógica y cinco pruebas de interfaz antes de preparar `dist`. Conserva la vigente más tres anteriores por módulo y los últimos conjuntos compatibles. `rollback` restaura solamente los instalables de `dist`; no modifica `src` ni Tampermonkey. Más detalles en [organización y updates](docs/organization-and-updates.md).

## Archivos de referencia

- [Contrato HUB y diseño compartido](docs/addon-design.md).
- [Catálogo auditado](docs/golden-catalog-audit.md).
- [Changelog](docs/changelog.md).
- [Notas anteriores a la reorganización](docs/history-before-organization.md): archivo histórico, no instrucciones actuales.
- [Capturas actuales](docs/screenshots/).

La integración depende de interfaces internas del cliente. Las pruebas locales verifican lógica e interfaz; falta confirmar detección durante una invasión real y movimiento/combate/reset en una partida real. No se publicaron archivos en Internet ni se modificó la instalación del navegador.
