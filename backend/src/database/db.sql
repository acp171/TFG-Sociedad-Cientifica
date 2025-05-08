-- SOCIO_ROL TABLE --
CREATE TABLE IF NOT EXISTS Socio_Rol(
    id_socio_rol SERIAL PRIMARY KEY,
    rol VARCHAR(16) NOT NULL
);

-- TIPO_SOCIO TABLE --
CREATE TABLE IF NOT EXISTS Tipo_Socio(
    id_tipo_socio SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(1000) NOT NULL
);

-- SOCIO TABLE --
CREATE TABLE IF NOT EXISTS Socio(
    id_socio SERIAL PRIMARY KEY,
    nombre VARCHAR(16) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    telefono VARCHAR(16) NOT NULL,
    fecha_nacimiento TIMESTAMP NOT NULL,
    fecha_alta TIMESTAMP NOT NULL,
    socio_rol INT NOT NULL,
    tipo_socio INT NOT NULL,
    CONSTRAINT FK_SOCIO_ROL_SOCIO FOREIGN KEY (socio_rol) REFERENCES Socio_Rol(id_socio_rol),
    CONSTRAINT FK_SOCIO_TIPO_SOCIO FOREIGN KEY (tipo_socio) REFERENCES Tipo_Socio(id_tipo_socio)
);

-- DIRECCION TABLE --
CREATE TABLE IF NOT EXISTS Direccion(
    id_direccion SERIAL PRIMARY KEY,
    calle VARCHAR(100) NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    provincia VARCHAR(50),
    socio INT NOT NULL,
    CONSTRAINT FK_DIRECCION_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio)
);

-- PUBLICACIONES TABLE --
CREATE TABLE IF NOT EXISTS Publicaciones(
    id_publicacion SERIAL PRIMARY KEY,
    titulo VARCHAR(1000) NOT NULL,
    contenido VARCHAR(256),
    fecha_publicacion TIMESTAMP NOT NULL,
    socio INT NOT NULL,
    CONSTRAINT FK_PUBLICACION_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio)
);

-- COMENTARIO_PUBLICACION TABLE --
CREATE TABLE IF NOT EXISTS Comentario_Publicacion(
    id_comentario SERIAL,
    comentario VARCHAR(256) NOT NULL,
    socio INT NOT NULL,
    publicacion INT NOT NULL,
    fecha_comentario TIMESTAMP NOT NULL,
    visibilidad BOOLEAN NOT NULL,
    PRIMARY KEY (id_comentario, publicacion),
    CONSTRAINT FK_COMENTARIO_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio)
);

-- EVENTO TABLE --
CREATE TABLE IF NOT EXISTS Evento(
    id_evento SERIAL PRIMARY KEY,
    nombre_evento VARCHAR(256) NOT NULL,
    fecha_evento_inicio TIMESTAMP NOT NULL,
    fecha_evento_fin TIMESTAMP NOT NULL,
    descripcion_evento VARCHAR(1000) NOT NULL,
    direccion INT NOT NULL,
    CONSTRAINT FK_EVENTO_DIRECCION FOREIGN KEY (direccion) REFERENCES Direccion(id_direccion)
);


-- INSCRIPCIONES TABLE --
CREATE TABLE IF NOT EXISTS Inscripciones(
    estado_inscripcion VARCHAR(256) NOT NULL,
    evento INT NOT NULL,
    socio INT NOT NULL,
    PRIMARY KEY (socio, evento),
    CONSTRAINT FK_INSCRIPCION_EVENTO FOREIGN KEY (evento) REFERENCES Evento(id_evento),
    CONSTRAINT FK_INSCRIPCION_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio)    
);

-- NOTIFICACIONES TABLE --
CREATE TABLE IF NOT EXISTS Notificaciones(
    id_notificacion SERIAL,
    socio INT NOT NULL,
    mensaje VARCHAR(1000) NOT NULL,
    fecha_envio TIMESTAMP NOT NULL,
    estado_lectura VARCHAR(25) NOT NULL,
    PRIMARY KEY (id_notificacion, socio),
    CONSTRAINT FK_NOTIFICACION_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio)    
);

-- PROYECTOS_INVESTIGACION TABLE --
CREATE TABLE IF NOT EXISTS Proyectos_Investigacion(
    id_proyecto SERIAL PRIMARY KEY,
    nombre_proyecto INT NOT NULL,
    descripcion VARCHAR(1000) NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    estado VARCHAR(25) NOT NULL
);

-- SOCIO_PROYECTO TABLE --
CREATE TABLE IF NOT EXISTS Socio_Proyecto(
    rol_proyecto VARCHAR(50) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL,
    socio INT NOT NULL,
    proyecto INT NOT NULL,
    PRIMARY KEY (socio, proyecto),
    CONSTRAINT FK_SOCIO_PRO_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio),
    CONSTRAINT FK_SOCIO_PROYECTO_PROYECTO FOREIGN KEY (proyecto) REFERENCES Socio(id_proyecto)
);