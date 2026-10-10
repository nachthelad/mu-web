# Revamp del Centro de control · opción A

## Estado y objetivo

El usuario eligió la opción A del mockup de Leveleo: editor amplio con resumen lateral. Conserva la estética oscura, oliva y dorada. Esta especificación extiende esa distribución a las seis secciones y queda pendiente de revisión del usuario antes de implementar.

Reducir desplazamiento vertical y aprovechar el ancho sin reducir legibilidad, tamaño útil de controles ni funcionalidad. La barra superior real permanece intacta, incluidos navegación, conexión, selector, controles y comportamiento sticky. La barra simplificada del mockup es ilustrativa y no prescribe cambios a la barra real.

## Distribución común

- Contenido alineado con los márgenes de la barra superior, sin el límite estrecho actual de main y mirror.
- Título compacto de sección y contexto de cuenta en línea; importación como acción secundaria.
- Sin gran card exterior ni cards anidadas. Separadores de 1px, espacio y títulos establecen agrupaciones.
- Área principal flexible y lateral de aproximadamente 280–320px cuando el ancho útil lo permita. Cada sección usa solo las columnas que su contenido necesita; no se agregan paneles vacíos.
- Guardar/Cancelar originales en pie visible, con mensajes de estado y sin tapar controles. Texto explícito sobre guardado inmediato de switches y guardado manual de coordenadas/niveles.

## Secciones

| Sección | Área principal | Lateral o segunda columna |
| --- | --- | --- |
| Leveleo | Selector original de mapa, habilitación y nivel en una fila adaptable; spots en filas con ON/OFF, X, Y y acciones | Progresión configurada original, Reset y Soul Shield; explicación breve de persistencia |
| Goldens | Destinos en filas con habilitación, mapa, nivel y orden | Opciones existentes de cacería y estado |
| Obtener | Categorías en distribución horizontal adaptable; editor de nombres y condiciones | Rango y ayuda/estado cuando el ancho lo permita |
| Party | Dos preferencias existentes alineadas en filas compactas | Sin lateral artificial ni contenido inventado |
| Visualización | Trackeo y Estilos como columnas funcionales sin cards | Controles originales de alas/casco, estados y ayuda en su grupo correspondiente |
| Estadísticas | Preferencia original y explicación compacta | Sin tabla A/B inventada: las capturas siguen en C dentro del juego |

Leveleo mantiene el selector de mapas original, sin añadir un segundo listado editable. Cada fila de spot mantiene captura de ubicación, duplicación, eliminación, estado y errores. La progresión usa la información original y no recalcula reglas desde el panel. Recuperación del formato anterior y ayuda de observaciones conservan sus disclosures originales.

Radar/historial y EXP por spot reciben únicamente ajustes compartidos de ancho y superficies necesarios para coherencia; no se rediseñan sus funciones ni se modifica la interpretación de datos.

## Ventanas angostas y accesibilidad

El lateral pasa debajo del área principal cuando no cabe. Filas de spots reorganizan acciones debajo de coordenadas; los campos mantienen sus etiquetas. No se ocultan funciones ni hay overflow horizontal de página. Conservar orden de lectura razonable, tabulación, foco visible, etiquetas, estados aria y selección/cursor. Los errores no dependen exclusivamente del color. Sin animaciones decorativas necesarias.

## Arquitectura y comportamiento

Priorizar presentación en src/extension/panel.css y el CSS externo que renderer.js agrega a los Shadow DOM proyectados. panel.html y panel.js solo cambian si la distribución necesita metadatos de presentación. Conservar IDs opacos, controles originales, eventos, nodos, actualizaciones incrementales y protección de edición pendiente. No duplicar controles ni crear otra copia de preferencias, motor, temporizador o regla de juego.

Si mover un control entre padres interfiere con la reconciliación incremental o el foco, usar disposición CSS sobre la estructura original. Cualquier estructura compartida adicional deberá justificarse y verificarse en standalone antes de adoptarse.

Spots, Usar este mapa, Reset y Soul Shield conservan guardado inmediato; Cancelar no los revierte. Coordenadas y niveles requieren Guardar. Preservar validación, rollback, mensajes y borradores, sesiones/cuentas y descarte de respuestas obsoletas. No modificar permisos ni almacenamiento. Mantener Tampermonkey standalone.

## Validación y entrega

Registrar baseline real de las seis secciones con mismos datos y viewport que las capturas finales. Medir altura de contenido y overflow en viewport amplio y angosto; no declarar porcentajes anticipados ni tomar el mockup como baseline funcional. Probar varios spots y listas extensas, todas las acciones existentes, teclado/foco durante actualizaciones del puente, guardado inmediato, Guardar/Cancelar, error de validación, rollback y cambio de sesión. Ejecutar pruebas existentes pertinentes y añadir solo regresiones de comportamiento o layout que aporten evidencia.

Tras aprobar especificación: preparar plan con writing-plans, implementar preservando cambios ajenos, verificar demos/perfil aislado y generar release local completo y ZIP mediante proceso oficial. Revisar versiones vigentes al ejecutar, actualizar versiones/changelog/documentación según cambios, no editar dist/releases manualmente. Antes de release comprobar que no hay ediciones concurrentes; las validaciones oficiales no se omiten.

No usar cuenta real, instalar en navegador habitual ni publicar en Internet. Entrega con capturas comparables, resultados de validación, instalable local y limitaciones respecto de partida real.

## Referencia visual

Mockup local: .superpowers/brainstorm/ui-revamp-20261010/content/layout-options.html, modo A. Contenido ilustrativo con datos de ejemplo y controles sin conexión al juego.
