# Ampliación del selector de alas

Alcance autorizado: implementación en este chat y release local de Helper; sin cuenta, instalación ni publicación web.

- [x] Leer instrucciones y revisar fuentes, estado local, adaptación de render y transacciones.
- [x] Auditar ItemSlot 7 y wingSpec del cliente público desplegado; conservar Originales y Blade Knight.
- [x] Ampliar el catálogo y reutilizar WingStyle; guardar wingStyle opcional en preferencias v1 existentes.
- [x] Agregar cobertura de todos los estilos, cambios directos y cargas pendientes.
- [x] Verificar selección, Guardar/Cancelar/rollback y restauración en demo, incluidos viewport compacto y aislamiento del equipo.
- [x] Registrar Helper 1.17.0 y ejecutar release de Helper con todas las validaciones; contrastar hashes finales.

Release local: 129 pruebas de lógica y 15 suites de interfaz aprobadas, sintaxis validada. Conjunto `2026-10-08T00-41-10-337Z-d7982f`; los otros cinco módulos conservan sus hashes. Instalable `dist/level-helper.user.js`, SHA-256 `a0192c4e30988b4159e56aa4acba2bf8e2c24375bed095cd3ba71c0e7981fe24`. La primera ejecución restringida falló en fetch al servidor local; la ejecución con acceso local completó todas las validaciones sin omitir ninguna.

La versión upstream más reciente contiene opciones ausentes del despliegue. Incluir solo las 16 reconocidas por el cliente auditado. Brillos, nivel y propiedades visuales se derivan del equipo original. Las pruebas simuladas no confirman renderizado en partida real.
