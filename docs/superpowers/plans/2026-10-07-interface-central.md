# Interfaz central: plan

1. Generar textura repetible con imagegen y conservar original en src/interface/assets. Exportar y embeber WebP mediante scripts/build-interface-texture.cjs.
2. Cambiar desplazamientos de controles y recortes decorativos en src/interface/interface.user.js, versión 1.1.0. Reservar margen de chat y mantener lógica nativa.
3. Verificar proximidad de orbes, coords fuera del toggle y casos previos con tests/interface-ui.cjs; capturar barra amplia/compacta.
4. Actualizar changelog/documentación y ejecutar npm run release -- --module interface sin saltar validaciones. Verificar manifiesto y que los demás módulos mantienen sus hashes.
