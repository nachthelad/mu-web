# Golden hunt: respuesta a detecciones y cuota por mapa

Diseño aprobado en conversación el 2026-10-04. El usuario confirmó que la elegibilidad depende del requisito de entrada del mapa y autorizó la implementación.

## Objetivo

Perseguir rápidamente los dorados vivos que muestra Radar, sostener el combate hasta una resolución comprobable y pasar a otro mapa después de cinco kills propias confirmadas. Mantener loot de Kundun, límite de búsqueda y retorno al leveleo.

## Detección y prioridades

- Radar expone su snapshot de objetivos vivos y posiciones recientes mediante una capacidad aditiva del contrato v1. Notifica cambios relevantes a Helper desde su motor existente. No se crea otro detector ni otro motor en HUB.
- Una detección viva interrumpe la patrulla pendiente. Helper evalúa y ejecuta la nueva prioridad al recibir la actualización, sin esperar su refresh general de 500 ms; se agrupan notificaciones repetidas y se evita reentrada. Medir latencia desde detección de Radar hasta intención de persecución en demo; objetivo: mismo turno de actualización o menos de 100 ms. La recepción de datos del servidor, desplazamiento y ataque no tienen garantía de tiempo instantáneo.
- Radar y Helper comparten criterios de identidad, mapa y visibilidad. La ausencia de worldIndex se admite cuando la entidad pertenece al mundo actual; un índice explícito de otro mapa se rechaza.
- Los objetivos vivos del mapa tienen prioridad sobre límites aproximados de regiones de patrulla. Las regiones solo organizan spots y recorridos. Una marca reciente dirige una búsqueda acotada, pero no autoriza atacar una entidad desaparecida; después se retoma patrulla. El historial conserva su papel de spots y nunca acredita presencia actual.
- Priorizar destinos por el nivel de sus dorados, obtenido de definiciones verificadas del cliente/servidor. No inferir nivel del ID de tipo ni del requisito de entrada. Los tipos sin nivel verificable no reciben un nivel inventado. Dentro del mapa, elegir primero el objetivo de mayor nivel y desempatar por distancia alcanzable; mantenerlo durante la persecución/combate para evitar oscilaciones.
- Antes del traslado, filtrar según nivel del personaje y requisito conocido por destino/clase/servidor. Mantener el aprendizaje por rechazo explícito del comando cuando falta el requisito. No excluir un dorado porque su nivel supere al del personaje.

## Persecución y combate

Separar búsqueda, persecución, combate y espera de drop. Verificar las interfaces upstream de movimiento, alcance de skill y confirmación de daño/muerte antes de implementarlas. Acercarse por terreno transitable y activar combate al entrar en alcance. Evitar sobrescribir continuamente una solicitud de skill pendiente. Usar la skill configurada y el ataque básico conforme a las capacidades verificadas del cliente.

Controlar progreso observable: acercamiento y, cuando el cliente lo informa, daño o acciones de combate. Un objetivo inaccesible o sin progreso se descarta de forma acotada y permite buscar otro. Perder visibilidad no equivale a muerte ni dispara automáticamente cuatro segundos de espera de cadáver.

Home permanece apagado durante la cacería. Helper conserva un único servicio de acciones y limpia solamente movimientos, ataques y recogidas propios. Cancelación, muerte, desconexión y carga de mapa invalidan acciones pendientes según el comportamiento existente.

## Cinco kills y salida

- Contar solamente muertes de dorados atribuidas al personaje por una señal comprobada del cliente/servidor. Deduplicar por encuentro para que un netId reutilizado no confunda kills. No contar desapariciones, daño, cajas recogidas ni kills de otros jugadores.
- La cuota es cinco por mapa físico y evento. Atlans2 y Atlans3 comparten ID y contador: completar cinco en cualquiera omite los destinos restantes de Atlans durante esa cacería.
- Mantener cinco minutos de búsqueda por destino como máximo. Salir antes cuando se completa la cuota del mapa. El loot pendiente tiene prioridad al cerrar por cuota, tiempo o fin del evento.
- Tras la quinta kill, resolver la espera acotada del drop y recoger el Kundun correspondiente antes del traslado. Rechazo o falta de confirmación conserva el error visible existente; no declarar loot exitoso.
- Mostrar kills del mapa sobre cinco y Kundun confirmados como contadores separados. Al finalizar, retomar leveleo si Helper sigue habilitado.

## Alcance y compatibilidad

Modificar Radar para el feed compartido y Helper para decisiones/acciones. HUB solo requerirá cambios si su presentación necesita mostrar el contador nuevo. Conservar claves de almacenamiento, contrato v1, historial, configuración de Home y el ajuste preexistente de timers nativos en Helper 1.9.2. Detectar capacidades ausentes y mostrar incompatibilidad sin iniciar una cacería incompleta.

## Validación y entrega

Reproducir en demo: dorado visible sin worldIndex, dorado fuera de región aproximada, detección durante patrulla pendiente, pérdida de scope sin muerte, objetivo móvil, camino bloqueado, combate y progreso, prioridad por nivel, requisitos aprendidos, kills propias/ajenas/repetidas, quinta kill con Kundun pendiente y cuota compartida Atlans2/3. Verificar cancelación y retorno al leveleo.

Medir la reacción del adaptador real de Helper en la demo, además de pruebas puras del motor. No usar una cuenta real. Actualizar documentación y changelog, aumentar versiones de módulos modificados y ejecutar release con todas sus validaciones. Entregar instalables de dist; no instalar ni publicar en Internet. Las simulaciones no confirman funcionamiento en partida real.
