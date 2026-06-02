const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SCDI API',
      version: '1.0.0',
      description: 'API REST de la Sociedad Científica de Desarrollo Informático (SCDI)',
    },
    servers: [{ url: 'https://tfg-sociedad-cientifica-production.up.railway.app' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    tags: [
      { name: 'Autenticación' },
      { name: 'Perfil' },
      { name: 'Socios' },
      { name: 'Artículos' },
      { name: 'Eventos' },
      { name: 'Proyectos' },
      { name: 'Comités' },
      { name: 'Notificaciones' },
      { name: 'Administración' },
    ],
    paths: {
      // ── AUTH ──────────────────────────────────────────────────────────
      '/login': {
        post: {
          tags: ['Autenticación'], summary: 'Iniciar sesión',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } } },
          responses: { 200: { description: 'JWT y datos del socio' }, 401: { description: 'Credenciales incorrectas' } },
        },
      },
      '/register': {
        post: {
          tags: ['Autenticación'], summary: 'Registrar nuevo socio',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { nombre: { type: 'string' }, apellidos: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, telefono: { type: 'string' }, fecha_nacimiento: { type: 'string', format: 'date' }, id_tipo_socio: { type: 'integer' } } } } } },
          responses: { 201: { description: 'Socio registrado, devuelve clientSecret de Stripe si la cuota > 0' }, 400: { description: 'Datos inválidos o email duplicado' } },
        },
      },
      '/auth/forgot-password': {
        post: {
          tags: ['Autenticación'], summary: 'Solicitar restablecimiento de contraseña',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } } } } } },
          responses: { 200: { description: 'Respuesta siempre 200 por seguridad (no revela si el email existe)' } },
        },
      },
      '/auth/reset-password': {
        post: {
          tags: ['Autenticación'], summary: 'Restablecer contraseña con token',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, password: { type: 'string' } } } } } },
          responses: { 200: { description: 'Contraseña actualizada' }, 400: { description: 'Token inválido o contraseña muy corta' } },
        },
      },

      // ── PERFIL ────────────────────────────────────────────────────────
      '/perfil': {
        get: { tags: ['Perfil'], summary: 'Obtener perfil del socio autenticado', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Datos del socio' }, 401: { description: 'Sin token' } } },
        patch: { tags: ['Perfil'], summary: 'Actualizar datos del perfil', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { nombre: { type: 'string' }, apellidos: { type: 'string' }, telefono: { type: 'string' } } } } } }, responses: { 200: { description: 'Perfil actualizado' } } },
        delete: { tags: ['Perfil'], summary: 'Dar de baja la propia cuenta', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Cuenta eliminada' } } },
      },
      '/renovar-suscripcion': {
        post: { tags: ['Perfil'], summary: 'Renovar suscripción del socio', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Suscripción renovada o clientSecret de Stripe si cuota > 0' } } },
      },

      // ── SOCIOS ────────────────────────────────────────────────────────
      '/socios/listado-socios': {
        get: { tags: ['Socios'], summary: 'Listar todos los socios (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Lista de socios' }, 403: { description: 'No es administrador' } } },
      },
      '/socios/crear-socios': {
        post: { tags: ['Socios'], summary: 'Crear socio manualmente (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Socio creado' } } },
      },
      '/corporacion/miembros': {
        get: { tags: ['Socios'], summary: 'Obtener miembros de una corporación', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Lista de miembros corporativos' } } },
        post: { tags: ['Socios'], summary: 'Añadir miembro a una corporación', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Miembro añadido' } } },
      },
      '/corporacion/miembros/{id}': {
        delete: { tags: ['Socios'], summary: 'Eliminar miembro de una corporación', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Miembro eliminado' } } },
      },

      // ── ARTÍCULOS ─────────────────────────────────────────────────────
      '/listado-articulos-cientificos': {
        get: { tags: ['Artículos'], summary: 'Listar todos los artículos científicos (público)', responses: { 200: { description: 'Lista de artículos' } } },
      },
      '/articulos-cientificos/{id}': {
        get: { tags: ['Artículos'], summary: 'Obtener artículo por ID o slug', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID numérico o slug del artículo' }], responses: { 200: { description: 'Artículo y sus comentarios' }, 404: { description: 'No encontrado' } } },
        delete: { tags: ['Artículos'], summary: 'Eliminar artículo (autor o admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Artículo eliminado' }, 403: { description: 'Sin permisos' } } },
      },
      '/articulos-cientificos/publicar-articulo-cientifico': {
        post: { tags: ['Artículos'], summary: 'Publicar un artículo científico', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { titulo: { type: 'string' }, contenido: { type: 'string' }, pdf: { type: 'string', format: 'binary' } } } } } }, responses: { 200: { description: 'Artículo publicado' } } },
      },
      '/articulos-cientificos/{id}/comentarios': {
        post: { tags: ['Artículos'], summary: 'Añadir comentario a un artículo', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { comentario: { type: 'string' } } } } } }, responses: { 200: { description: 'Comentario creado' } } },
      },
      '/articulos-cientificos/{id}/comentarios/{id_comentario}/moderar': {
        patch: { tags: ['Artículos'], summary: 'Moderar visibilidad de un comentario (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }, { name: 'id_comentario', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Visibilidad alternada' } } },
      },

      // ── EVENTOS ───────────────────────────────────────────────────────
      '/listado-eventos-cientificos': {
        get: { tags: ['Eventos'], summary: 'Listar todos los eventos (público)', responses: { 200: { description: 'Lista de eventos' } } },
      },
      '/eventos-cientificos/{id}': {
        get: { tags: ['Eventos'], summary: 'Obtener evento por ID o slug', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Datos del evento' }, 404: { description: 'No encontrado' } } },
        put: { tags: ['Eventos'], summary: 'Actualizar evento', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Evento actualizado' } } },
        delete: { tags: ['Eventos'], summary: 'Eliminar evento (admin/comité)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Evento eliminado' } } },
      },
      '/eventos-cientificos/crear-evento-cientifico': {
        post: { tags: ['Eventos'], summary: 'Crear un evento científico', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Evento creado' } } },
      },
      '/eventos-cientificos/{id}/inscribirse': {
        post: { tags: ['Eventos'], summary: 'Inscribirse a un evento', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Inscripción confirmada o clientSecret si precio > 0' } } },
      },
      '/eventos-cientificos/{id}/cancelar-inscripcion': {
        delete: { tags: ['Eventos'], summary: 'Cancelar inscripción a un evento', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Inscripción cancelada' } } },
      },
      '/incripciones/listado-incripciones-usuario': {
        get: { tags: ['Eventos'], summary: 'Ver mis inscripciones a eventos', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Lista de inscripciones del usuario' } } },
      },

      // ── PROYECTOS ─────────────────────────────────────────────────────
      '/listado-proyectos-investigacion': {
        get: { tags: ['Proyectos'], summary: 'Listar proyectos de investigación (público)', responses: { 200: { description: 'Lista de proyectos' } } },
      },
      '/proyectos-investigacion/{id}': {
        get: { tags: ['Proyectos'], summary: 'Obtener proyecto por ID o slug', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Datos del proyecto y miembros' } } },
        put: { tags: ['Proyectos'], summary: 'Actualizar proyecto (presidente o admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Proyecto actualizado' } } },
        delete: { tags: ['Proyectos'], summary: 'Eliminar proyecto (presidente o admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Proyecto eliminado' } } },
      },
      '/proyectos-investigacion/crear-proyecto-investigacion': {
        post: { tags: ['Proyectos'], summary: 'Crear proyecto de investigación', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Proyecto creado' } } },
      },
      '/proyectos-investigacion/{id}/miembros': {
        post: { tags: ['Proyectos'], summary: 'Añadir miembro al proyecto', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Miembro añadido' } } },
      },
      '/proyectos-investigacion/{id}/miembros/{id_socio}': {
        delete: { tags: ['Proyectos'], summary: 'Expulsar miembro del proyecto', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }, { name: 'id_socio', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Miembro eliminado' } } },
      },

      // ── COMITÉS ───────────────────────────────────────────────────────
      '/listado-comites-cientificos': {
        get: { tags: ['Comités'], summary: 'Listar comités científicos', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Lista agrupada de comités y miembros' } } },
      },
      '/crear-comite-cientifico': {
        post: { tags: ['Comités'], summary: 'Crear comité científico (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Comité creado' } } },
      },
      '/add-miembro-comite-cientifico': {
        post: { tags: ['Comités'], summary: 'Añadir miembro a un comité', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Miembro añadido' } } },
      },
      '/eliminar-miembro-comite': {
        delete: { tags: ['Comités'], summary: 'Expulsar miembro de un comité', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Miembro eliminado' } } },
      },
      '/comites/{id}/mensajes': {
        get: { tags: ['Comités'], summary: 'Obtener mensajes del muro de un comité', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Lista de mensajes' } } },
        post: { tags: ['Comités'], summary: 'Enviar mensaje al muro del comité', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { mensaje: { type: 'string' } } } } } }, responses: { 201: { description: 'Mensaje enviado' } } },
      },

      // ── NOTIFICACIONES ────────────────────────────────────────────────
      '/listado-notificacion-usuario': {
        get: { tags: ['Notificaciones'], summary: 'Mis notificaciones', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Lista de notificaciones del usuario autenticado' } } },
      },
      '/listado-notificacion-usuario-sin-leer': {
        get: { tags: ['Notificaciones'], summary: 'Mis notificaciones sin leer', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Notificaciones no leídas' } } },
      },
      '/listado-notificaciones': {
        get: { tags: ['Notificaciones'], summary: 'Todas las notificaciones (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Lista global' }, 403: { description: 'No es administrador' } } },
      },
      '/notificacion-usuario': {
        post: { tags: ['Notificaciones'], summary: 'Enviar notificación a un socio (admin)', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { id_socio: { type: 'integer' }, titulo: { type: 'string' }, mensaje: { type: 'string' } } } } } }, responses: { 200: { description: 'Notificación enviada' } } },
      },
      '/notificacion-contacto': {
        post: { tags: ['Notificaciones'], summary: 'Enviar mensaje de contacto', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, titulo: { type: 'string' }, mensaje: { type: 'string' } } } } } }, responses: { 200: { description: 'Mensaje enviado' }, 403: { description: 'Email no coincide con el del token' } } },
      },
      '/notificaciones/{id}/leida': {
        patch: { tags: ['Notificaciones'], summary: 'Marcar notificación como leída', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Marcada como leída' } } },
      },

      // ── ADMINISTRACIÓN ────────────────────────────────────────────────
      '/roles': {
        get: { tags: ['Administración'], summary: 'Listar roles del sistema', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Lista de roles' } } },
        post: { tags: ['Administración'], summary: 'Crear rol', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Rol creado' } } },
      },
      '/roles/{id}': {
        put: { tags: ['Administración'], summary: 'Actualizar rol', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Rol actualizado' } } },
        delete: { tags: ['Administración'], summary: 'Eliminar rol', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Rol eliminado' } } },
      },
      '/tipos': {
        get: { tags: ['Administración'], summary: 'Listar tipos de socio', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Lista de tipos' } } },
        post: { tags: ['Administración'], summary: 'Crear tipo de socio', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Tipo creado' } } },
      },
      '/tipos/{id}': {
        put: { tags: ['Administración'], summary: 'Actualizar tipo de socio', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Tipo actualizado' } } },
        delete: { tags: ['Administración'], summary: 'Eliminar tipo de socio', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Tipo eliminado' } } },
      },
      '/asignar-rol': {
        put: { tags: ['Administración'], summary: 'Asignar rol a un socio', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Rol asignado' } } },
      },
      '/eliminar-rol': {
        delete: { tags: ['Administración'], summary: 'Quitar rol a un socio', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Rol eliminado' } } },
      },
      '/buscar-calles': {
        get: { tags: ['Administración'], summary: 'Buscar calles por geocodificación (Nominatim)', parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Lista de resultados de calles' } } },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
