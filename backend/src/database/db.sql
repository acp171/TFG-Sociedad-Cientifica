-- SOCIO_ROL TABLE --
CREATE TABLE IF NOT EXISTS Socio_Rol (
    id_socio_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- TIPO_SOCIO TABLE --
CREATE TABLE IF NOT EXISTS Tipo_Socio (
    id_tipo_socio SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(1000) NOT NULL,
    cuota FLOAT NOT NULL,
    price_stripe TEXT UNIQUE NOT NULL
);

-- SOCIO TABLE --
CREATE TABLE IF NOT EXISTS Socio (
    id_socio SERIAL PRIMARY KEY,
    nombre VARCHAR(16) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(1000) NOT NULL,
    telefono VARCHAR(16) NOT NULL,
    fecha_nacimiento TIMESTAMP NOT NULL,
    fecha_alta TIMESTAMP NOT NULL,
    socio_rol INT NOT NULL,
    tipo_socio INT NOT NULL,
    CONSTRAINT FK_SOCIO_ROL_SOCIO FOREIGN KEY (socio_rol) REFERENCES Socio_Rol(id_socio_rol) ON DELETE CASCADE,
    CONSTRAINT FK_SOCIO_TIPO_SOCIO FOREIGN KEY (tipo_socio) REFERENCES Tipo_Socio(id_tipo_socio) ON DELETE CASCADE
);

-- DIRECCION TABLE --
CREATE TABLE IF NOT EXISTS Direccion (
    id_direccion SERIAL PRIMARY KEY,
    calle VARCHAR(100) NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    provincia VARCHAR(50) NOT NULL,
    extra TEXT,
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    socio INT,
    CONSTRAINT FK_DIRECCION_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio) ON DELETE CASCADE
);

-- PUBLICACIONES TABLE --
CREATE TABLE IF NOT EXISTS Publicaciones (
    id_publicacion SERIAL PRIMARY KEY,
    titulo VARCHAR(1000) NOT NULL,
    contenido TEXT,
    contenidopdf VARCHAR(1000),
    fecha_publicacion TIMESTAMP NOT NULL,
    socio INT NOT NULL,
    CONSTRAINT FK_PUBLICACION_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio) ON DELETE CASCADE
);

-- COMENTARIO_PUBLICACION TABLE --
CREATE TABLE IF NOT EXISTS Comentario_Publicacion (
    id_comentario SERIAL,
    comentario TEXT NOT NULL,
    socio INT NOT NULL,
    publicacion INT NOT NULL,
    fecha_comentario TIMESTAMP NOT NULL,
    visibilidad BOOLEAN NOT NULL,
    PRIMARY KEY (id_comentario, publicacion),
    CONSTRAINT FK_COMENTARIO_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio) ON DELETE CASCADE,
    CONSTRAINT FK_COMENTARIO_PUBLICACION FOREIGN KEY (publicacion) REFERENCES Publicaciones(id_publicacion) ON DELETE CASCADE
);

-- NOTIFICACIONES TABLE --
CREATE TABLE IF NOT EXISTS Notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    socio INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_lectura BOOLEAN DEFAULT FALSE,
    CONSTRAINT FK_NOTIFICACION_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio) ON DELETE CASCADE
);

-- PROYECTOS_INVESTIGACION TABLE --
CREATE TABLE IF NOT EXISTS Proyectos_Investigacion (
    id_proyecto SERIAL PRIMARY KEY,
    nombre_proyecto  VARCHAR(100) NOT NULL,
    descripcion VARCHAR(1000) NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    estado VARCHAR(25) NOT NULL
);

-- SOCIO_PROYECTO TABLE --
CREATE TABLE IF NOT EXISTS Socio_Proyecto (
    fecha_registro TIMESTAMP NOT NULL,
    socio INT NOT NULL,
    proyecto INT NOT NULL,
    rol_proyecto INT NOT NULL,
    PRIMARY KEY (socio, proyecto),
    CONSTRAINT FK_SOCIO_PRO_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio) ON DELETE CASCADE,
    CONSTRAINT FK_SOCIO_PROYECTO_PROYECTO FOREIGN KEY (proyecto) REFERENCES Proyectos_Investigacion(id_proyecto) ON DELETE CASCADE,
    CONSTRAINT FK_SOCIO_PROYECTO_SOCIO_ROL FOREIGN KEY (rol_proyecto) REFERENCES Socio_Rol(id_socio_rol) ON DELETE CASCADE
);

-- COMITE TABLE --
CREATE TABLE IF NOT EXISTS Comite (
    id_comite SERIAL PRIMARY KEY,
    nombre_comite VARCHAR(50) NOT NULL,
    descripcion VARCHAR(1000),
    fecha_creacion TIMESTAMP NOT NULL
);

-- MIEMBROS_COMITE TABLE --
CREATE TABLE IF NOT EXISTS Miembros_Comite (
    fecha_registro TIMESTAMP NOT NULL,
    socio INT NOT NULL,
    comite INT NOT NULL,
    rol_comite int NOT NULL,
    PRIMARY KEY (socio, comite),
    CONSTRAINT FK_MIEMBROS_COMITE_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio) ON DELETE CASCADE,
    CONSTRAINT FK_MIEMBROS_COMITE_COMITE FOREIGN KEY (comite) REFERENCES Comite(id_comite) ON DELETE CASCADE,
    CONSTRAINT FK_MIEMBROS_COMITE_SOCIO_ROL FOREIGN KEY (rol_comite) REFERENCES Socio_Rol(id_socio_rol) ON DELETE CASCADE
);

-- EVENTO TABLE --
CREATE TABLE IF NOT EXISTS Evento (
    id_evento SERIAL PRIMARY KEY,
    nombre_evento VARCHAR(256) NOT NULL,
    fecha_evento_inicio TIMESTAMP NOT NULL,
    fecha_evento_fin TIMESTAMP NOT NULL,
    descripcion_evento TEXT NOT NULL,
    direccion INT NOT NULL,
    comite INT,
    CONSTRAINT FK_EVENTO_DIRECCION FOREIGN KEY (direccion) REFERENCES Direccion(id_direccion) ON DELETE CASCADE,
    CONSTRAINT FK_EVENTO_COMITE FOREIGN KEY (comite) REFERENCES Comite(id_comite) ON DELETE CASCADE
);


-- INSCRIPCIONES TABLE --
CREATE TABLE IF NOT EXISTS Inscripciones (
    estado_inscripcion VARCHAR(256) NOT NULL,
    evento INT NOT NULL,
    socio INT NOT NULL,
    PRIMARY KEY (socio, evento),
    CONSTRAINT FK_INSCRIPCION_EVENTO FOREIGN KEY (evento) REFERENCES Evento(id_evento) ON DELETE CASCADE,
    CONSTRAINT FK_INSCRIPCION_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio) ON DELETE CASCADE  
);

-- FORMA_PAGO TABLE --
CREATE TABLE IF NOT EXISTS Forma_Pago (
    id_forma_pago SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    socio INT NOT NULL,
    CONSTRAINT FK_FORMA_PAGO_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Tarjeta_Credito (
    forma_pago INT PRIMARY KEY,
    numero_tarjeta VARCHAR(20),
    fecha_expiracion DATE,
    codigo_expiracion VARCHAR(3),
    CONSTRAINT FK_TARJETA_CREDITO_FORMA_PAGO FOREIGN KEY (forma_pago) REFERENCES Forma_Pago(id_forma_pago) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Paypal (
    forma_pago INT PRIMARY KEY,
    email_paypal VARCHAR(100),
    CONSTRAINT FK_TARJETA_CREDITO_FORMA_PAGO FOREIGN KEY (forma_pago) REFERENCES Forma_Pago(id_forma_pago) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Transferencia (
    forma_pago INT PRIMARY KEY,
    banco VARCHAR(100),
    numero_cuenta VARCHAR(16),
    CONSTRAINT FK_TARJETA_CREDITO_FORMA_PAGO FOREIGN KEY (forma_pago) REFERENCES Forma_Pago(id_forma_pago) ON DELETE CASCADE
);

-- PAGOS TABLE --
CREATE TABLE IF NOT EXISTS Pagos (
    id_pago SERIAL PRIMARY KEY,
    antia FLOAT NOT NULL,
    tipo_cuota VARCHAR(50) NOT NULL,
    fecha_pago TIMESTAMP NOT NULL,
    estado_pago VARCHAR(50) NOT NULL,
    socio INT NOT NULL,
    forma_pago INT NOT NULL,
    CONSTRAINT FK_PAGOS_SOCIO FOREIGN KEY (socio) REFERENCES Socio(id_socio) ON DELETE CASCADE,
    CONSTRAINT FK_PAGOS_FORMA_PAGO FOREIGN KEY (forma_pago) REFERENCES Forma_Pago(id_forma_pago) ON DELETE CASCADE
);

-- Insertar valores en la tabla Socio_Rol
INSERT INTO Socio_Rol (nombre) 
VALUES 
    ('Administrador'),
    ('Presidente'),
    ('Secretario'),
    ('Tesorero'),
    ('Vocal'),
    ('Miembro comité'),
    ('Miembro proyecto'),
    ('Socio');

-- Insertar valores en la tabla Tipo_Socio
INSERT INTO Tipo_Socio (nombre_tipo, descripcion, cuota, price_stripe) 
VALUES 
    ('Socio', 'Miembro asociado a la plataforma.', 20.0, 'price_1RaGzAPbMwKwBYLWadUDiRZT'),
    ('Estudiante', 'Miembro que se encuentra en formación académica.', 10.0, 'price_1RaHU2PbMwKwBYLWo0AaCRmB'),
    ('Profesional', 'Miembro con experiencia y/o titulación profesional.', 50.0, 'price_1RaaIcPbMwKwBYLW145DYXpp'),
    ('Honorario', 'Miembro que contribuye de manera honorífica a la plataforma.', 0.0, 'price_1RaaKePbMwKwBYLWPAhqnahb'),
    ('Internacional', 'Miembro con lenguaje extranjero.', 100.0, 'price_1RaHVqPbMwKwBYLWK7Uqmj3J'),
    ('Corporación', 'Asociación corporativa.', 500.0, 'price_1RaHVDPbMwKwBYLWrXVYmm7F');

-- Insertar valores en la tabla Socio
INSERT INTO Socio (nombre, apellidos, email, password, telefono, fecha_nacimiento, fecha_alta, socio_rol, tipo_socio) 
VALUES 
    ('admin', 'admin', 'admin@admin.com', '$2b$10$Y1rqKelTr4mRJL/RHtL18e0hj/eAvCGsW56TwROA9L/bTcvjCkfO.', '123456789', '2001-11-03 00:00:00', '2025-05-10 15:37:21.561', 1, 1),
    ('Ángel', 'Cardoso Parreño', 'acp171@gcloud1.ua.es', '$2b$10$SdT5faI11yQYepzIHzD33OhkgK9oNP77OHrI3Ri/Sppgn1yW2Vesm.', '123456789', '2001-11-03 00:00:00', '2025-05-10 15:37:21.561', 8, 2);

-- Insertar valores en la tabla Direccion
INSERT INTO Direccion(calle, ciudad, codigo_postal, provincia, latitud, longitud) 
VALUES 
    ('Carrer del Filet de Fora, 1', 'Elche', '03201', 'Alicante', null, null),
    ('Gran Vía, Malasaña, Universidad, Centro, Madrid, Comunidad de Madrid, 28013, España', 'Madrid', '28013', 'Comunidad de Madrid', 40.4226636, -3.7096954);
