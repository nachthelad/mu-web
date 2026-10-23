# Kalima en Radar

Diseño aprobado por el usuario el 18/10/2026: Kalima 1–6, spawn de referencia en 26, 76 y detección real de Illusion/Kundun.

Los mapas 24–29 muestran Kalima 1–6. Un rombo violeta y texto identifican el spawn como referencia OpenMU sin confirmar en este servidor y sin afirmar que el jefe está vivo. El Tracker existente muestra las entidades recibidas por el cliente con coordenadas reales, círculo lleno y rastro temporal hueco de 90 segundos. No garantiza detección fuera del alcance del cliente. Sin personaje o fuera de Kalima se oculta la referencia y se limpian los rastros de jefes.

Tipos verificados en las definiciones públicas de OpenMU: 161, 181, 189, 197, 267 y 338 para Illusion; 275 para Kundun. El servidor describe Kundun en K6, por lo que se admite también ese tipo en Kalima 6. Las definiciones upstream no prueban la configuración personalizada del servidor.

Se conserva el scheduler del Radar, contrato y almacenamiento v1. Los jefes no entran en el historial ni en los snapshots de caza de dorados. Release local oficial por módulo, sin instalar, push ni despliegue.

Fuente: https://github.com/MUnique/OpenMU/tree/master/src/Persistence/Initialization/VersionSeasonSix/Maps (Kalima1.cs a Kalima7.cs).
