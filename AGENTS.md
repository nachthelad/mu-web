# Trabajo en mu-web

- Limitar cambios y limpieza a esta carpeta. No borrar archivos fuera del proyecto.
- Leer `README.md`, `docs/organization-and-updates.md` y `docs/addon-design.md` antes de modificar módulos.
- Fuentes canónicas: `src/radar/golden-radar.user.js`, `src/helper/level-helper.user.js`, `src/hub/hub.user.js`. No recrear scripts en la raíz ni editar `dist` o copias de `releases`.
- Cada script conserva su motor. HUB monta los hosts existentes y no duplica temporizadores ni comandos. Mantener contrato v1 y claves de almacenamiento, o coordinar explícitamente una migración.
- Aumentar `@version` cuando cambia contenido publicado; registrar cambios en `docs/changelog.md`. Ejecutar `npm run release -- --module <radar|helper|hub>` para publicar un módulo o `npm run release` para el conjunto. No saltar validaciones.
- Coordinar ediciones concurrentes antes de publicar. Release verifica que las fuentes no cambiaron durante las pruebas.
- Entregar instalables desde `dist`; un script activo por módulo en Tampermonkey. Release y rollback son locales, no autorizan publicación web ni instalación en el navegador.
- Mantener vigente más tres anteriores por módulo, protegiendo versiones requeridas por los conjuntos conservados. La limpieza está implementada en el gestor de releases; no borrar respaldos a mano.
- Pruebas con demos sin cuenta real. La simulación no confirma funcionamiento en partida real.
