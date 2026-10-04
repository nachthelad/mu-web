# Organización y actualizaciones

Implementado el 2026-10-04. Todas las fuentes y operaciones pertenecen a esta carpeta de proyecto.

## Carpetas

| Carpeta | Uso |
| --- | --- |
| `src/radar`, `src/helper`, `src/hub` | Únicas fuentes editables, un userscript completo por módulo. |
| `demos/radar`, `demos/helper`, `demos/hub` | Simulaciones locales; cargan las fuentes de `src`. |
| `scripts` | Servidor local, validaciones, release y rollback. |
| `dist` | Conjunto vigente instalable y `manifest.json`; generado, no editar. |
| `releases/<módulo>/<versión>` | Copias inmutables y metadatos. |
| `releases/sets` | Manifiestos de conjuntos compatibles publicados. |
| `tests`, `tests/fixtures` | Pruebas de lógica, distribución e interfaz. |
| `docs`, `docs/screenshots` | Contrato, decisiones, cambios y evidencia vigente. |

Se reconciliaron fuentes divergentes: Radar 1.3.6 incorpora posición/altura de 1.3.5 y el adaptador HUB de 1.3.4.1. Helper usa 1.8.0, que ya tenía adaptador; HUB usa 1.1.2. Las copias anteriores disponibles quedaron clasificadas por módulo. No se inventaron respaldos de versiones que no estaban disponibles.

## Publicar una actualización local

1. Coordinar la edición del módulo entre chats. Modificar solamente su archivo en `src`. Conservar nombre, namespace y claves de almacenamiento; cambios del contrato requieren coordinación entre los tres módulos.
2. Incrementar `@version` y registrar cambios en `docs/changelog.md`. Una versión archivada no admite otro contenido.
3. Ejecutar `npm run release -- --module radar`, `helper` o `hub`. Para un cambio conjunto, ejecutar `npm run release`. La primera publicación también debe ser conjunta. El selector rechaza cambios pendientes en otros módulos.
4. El comando bloquea publicaciones concurrentes, verifica sintaxis y ejecuta todas las pruebas de lógica e interfaz. Comprueba que las fuentes no cambiaron durante la validación. Si no hubo cambios, conserva el conjunto existente.
5. Archiva copias completas, registra SHA-256, versiones, fecha UTC, contrato y validaciones en el manifiesto; prepara una distribución temporal. Sustituye `dist` por el conjunto completo, con respaldo del conjunto previo. Ante una falla ordinaria de promoción, restaura el anterior. La limpieza de versiones ocurre después de una promoción correcta.
6. Instalar desde `dist` reemplazando todo el contenido del mismo script en Tampermonkey. No crear duplicados activos. Recargar el juego. Un cambio incompatible requiere instalar los tres archivos del mismo conjunto.

El comando prepara archivos locales: no instala en el navegador ni publica por URL. El changelog se mantiene manualmente como parte del cambio.

## Retención y limpieza

Se conserva la vigente y las tres versiones anteriores de cada módulo. También se conserva el manifiesto vigente y tres conjuntos anteriores por fecha de publicación; todas las versiones necesarias para esos conjuntos quedan protegidas. Puede haber más de tres anteriores en un módulo si un conjunto protegido las necesita.

Las copias importadas tienen metadatos que advierten si no se verificó su compatibilidad. Una copia histórica sola no equivale a un conjunto probado. Capturas actuales se regeneran con `npm run test:ui`; las capturas obsoletas se retiraron. No se usan copias versionadas ni demos sueltas en la raíz.

## Restauración

Elegir un ID de `releases/sets` y ejecutar:

```text
npm run rollback -- --set <id>
```

El comando verifica hashes, versiones, contrato y sintaxis antes de restaurar el conjunto completo en `dist`. No modifica `src`: copiar de manera explícita una versión anterior a la fuente si se quiere retomar el desarrollo desde ella. Volver a instalar los archivos de `dist` en los mismos scripts de Tampermonkey y recargar. Una nueva release vuelve a publicar las fuentes actuales.

`localStorage` no forma parte del respaldo. Exportar el historial antes de cambios de formato y documentar si una migración de datos permite volver atrás.

## Interrupción del proceso

Una falla de validación mantiene `dist`. Una interrupción abrupta del equipo puede dejar `releases/.lock`, `.release-stage` o `.release-backup`; el próximo comando se detiene para no pisarlos. Confirmar que no hay proceso de release activo. Si existe `.release-backup`, verificar su manifiesto y hashes, preservar cualquier `dist` parcial y recuperar el respaldo como `dist`. Retirar la carpeta temporal y el lock únicamente después de esa recuperación. Todas esas rutas deben resolverse dentro de `D:\Cosas\Dev\mu-web`.

## Coordinación

Cada chat mantiene su motor o presentación; un responsable coordina cambios del contrato y publica el conjunto. No volver a escribir los archivos antiguos de la raíz. Git conserva la historia del código; los respaldos locales no sustituyen una copia fuera del equipo.
