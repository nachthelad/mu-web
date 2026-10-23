# Trabajo en mu-web

## Arquitectura de extensión y variantes

- Para crear una extensión independiente en otra carpeta, usar [la guía autocontenida](docs/standalone-extension-AGENTS.md) como `AGENTS.md` del proyecto nuevo. No necesita instalar ni modificar esta extensión.
- Antes de trabajar en integración con Chrome, puentes, panel externo o variantes por clase/personaje, leer [la guía de arquitectura](docs/extension-architecture.md).
- Los motores viven en la pestaña del juego; worker, puentes y panel externo conservan su función de transporte/presentación. Reutilizar las fuentes canónicas y la coordinación de Home existente.
- Actualmente Helper comparte preferencias entre personajes de una cuenta. Las estrategias por clase y los paquetes por variante descritos en la guía son propuestas, no funciones implementadas; cualquier nuevo alcance de perfiles requiere diseño explícito y conservación de datos.

## Preparación de pedidos

- Para redactar o mejorar prompts destinados a otro chat, usar el skill `project-prompter` (`C:/Users/nacht/.codex/skills/project-prompter/SKILL.md`). El chat Prompter prepara el encargo; no ejecuta lo que describe salvo un pedido separado del usuario.
- Consultar las instrucciones y documentación vigentes del proyecto, separar hechos verificados de pendientes y adaptar alcance, validación y entrega al pedido. No asumir versiones ni capacidades a partir del historial.
- Esta convención no agrega un paso de prompting a los pedidos directos de implementación ni autoriza enviar mensajes a otros chats sin indicación del usuario.

## Desarrollo

- Limitar cambios y limpieza a esta carpeta. No borrar archivos fuera del proyecto.
- Leer `README.md`, `docs/organization-and-updates.md` y `docs/addon-design.md` antes de modificar módulos.
- Fuentes canónicas: `src/radar/golden-radar.user.js`, `src/helper/level-helper.user.js`, `src/hub/hub.user.js`. No recrear scripts en la raíz ni editar `dist` o copias de `releases`.
- Cada script conserva su motor. HUB monta los hosts existentes y no duplica temporizadores ni comandos. Mantener contrato v1 y claves de almacenamiento, o coordinar explícitamente una migración.
- Aumentar `@version` cuando cambia contenido publicado; registrar cambios en `docs/changelog.md`. Ejecutar `npm run release -- --module <radar|helper|hub>` para publicar un módulo o `npm run release` para el conjunto. No saltar validaciones.
- Coordinar ediciones concurrentes antes de publicar. Release verifica que las fuentes no cambiaron durante las pruebas.
- Entregar instalables desde `dist`; un script activo por módulo en Tampermonkey. Release y rollback son locales, no autorizan publicación web ni instalación en el navegador.
- Mantener vigente más tres anteriores por módulo, protegiendo versiones requeridas por los conjuntos conservados. La limpieza está implementada en el gestor de releases; no borrar respaldos a mano.
- Pruebas con demos sin cuenta real. La simulación no confirma funcionamiento en partida real.
