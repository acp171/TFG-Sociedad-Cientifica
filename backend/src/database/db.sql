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
    fecha_expiracion TIMESTAMP,
    socio_rol INT NOT NULL,
    tipo_socio INT NOT NULL,
    corporacion INT REFERENCES Socio(id_socio),
    CONSTRAINT FK_SOCIO_ROL_SOCIO FOREIGN KEY (socio_rol) REFERENCES Socio_Rol(id_socio_rol) ON DELETE CASCADE,
    CONSTRAINT FK_SOCIO_TIPO_SOCIO FOREIGN KEY (tipo_socio) REFERENCES Tipo_Socio(id_tipo_socio) ON DELETE CASCADE
);

-- DIRECCION TABLE --
CREATE TABLE IF NOT EXISTS Direccion (
    id_direccion SERIAL PRIMARY KEY,
    calle VARCHAR(1000) NOT NULL,
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

CREATE TABLE IF NOT EXISTS PasswordResetTokens (
    id SERIAL PRIMARY KEY,
    socio INT NOT NULL,
    token_hash VARCHAR(128) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reset_usuario FOREIGN KEY (socio) REFERENCES Socio(id_socio) ON DELETE CASCADE
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
    ('admin', 'admin', 'admin@admin.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '123456789', '2001-11-03 00:00:00', '2025-05-10 15:37:21.561', 1, 1),
    ('Ángel', 'Cardoso Parreño', 'acp171@gcloud.ua.es', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '123456789', '2001-11-03 00:00:00', '2025-05-10 15:37:21.561', 8, 2);

-- Insertar valores en la tabla Direccion
INSERT INTO Direccion(calle, ciudad, codigo_postal, provincia, latitud, longitud) 
VALUES 
    ('Carrer del Filet de Fora, 1', 'Elche', '03201', 'Alicante', null, null),
    ('Gran Vía, Malasaña, Universidad, Centro, Madrid, Comunidad de Madrid, 28013, España', 'Madrid', '28013', 'Comunidad de Madrid', 40.4226636, -3.7096954);

-- ==========================================
-- INSERCIÓN DE MUCHOS DATOS DE PRUEBA EXTRAS
-- ==========================================

-- Más Direcciones
INSERT INTO Direccion(calle, ciudad, codigo_postal, provincia, latitud, longitud) 
VALUES 
    ('Paseo de Gracia, 15', 'Barcelona', '08007', 'Barcelona', 41.3891, 2.1678),
    ('Calle de Alcalá, 50', 'Madrid', '28014', 'Madrid', 40.4183, -3.6961),
    ('Plaza Mayor, 1', 'Salamanca', '37002', 'Salamanca', 40.9650, -5.6640),
    ('Av. de la Constitución, 3', 'Sevilla', '41001', 'Sevilla', 37.3854, -5.9931),
    ('Calle Larios, 20', 'Málaga', '29005', 'Málaga', 36.7202, -4.4214)
ON CONFLICT DO NOTHING;

-- Más Socios (usando la misma contraseña encriptada general para poder loguearse)
INSERT INTO Socio (nombre, apellidos, email, password, telefono, fecha_nacimiento, fecha_alta, fecha_expiracion, socio_rol, tipo_socio) 
VALUES 
    ('Laura', 'Martínez', 'laura.mart@email.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '611223344', '1995-05-12 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 2),
    ('Carlos', 'López', 'carlos.lopez@email.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '622334455', '1988-10-20 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Ana', 'García', 'ana.garcia@email.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '633445566', '1990-01-30 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 1),
    ('David', 'Fernández', 'david.f@email.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '644556677', '1985-07-14 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Elena', 'Ruiz', 'elena.ruiz@email.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '655667788', '1992-09-05 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 1),
    ('Javier', 'Sánchez', 'javi.sq@email.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '666778899', '1980-03-25 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Marta', 'Díaz', 'marta.diaz@email.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '677889900', '1998-11-18 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 2),
    ('Corporación Tech', 'SL', 'contacto@corptech.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '912345678', '2010-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 6),
    ('Universidad', 'Pública', 'info@universidad.edu', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '910000000', '1900-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 6)
ON CONFLICT (email) DO NOTHING;

-- Comités
INSERT INTO Comite (nombre_comite, descripcion, fecha_creacion)
VALUES 
    ('Comité de Inteligencia Artificial', 'Encargado de regular y promover investigaciones en IA.', CURRENT_TIMESTAMP),
    ('Comité de Ciberseguridad', 'Fomenta buenas prácticas y políticas de seguridad informática.', CURRENT_TIMESTAMP),
    ('Comité de Ingeniería de Software', 'Dedicado al estudio y mejora de metodologías ágiles y arquitecturas.', CURRENT_TIMESTAMP),
    ('Comité de Divulgación', 'Responsable de la organización de charlas, congresos y artículos públicos.', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Miembros Comité (Usando subconsultas por email para evitar errores de ID)
INSERT INTO Miembros_Comite (fecha_registro, socio, comite, rol_comite)
VALUES 
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='laura.mart@email.com'), (SELECT id_comite FROM Comite WHERE nombre_comite='Comité de Inteligencia Artificial'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='carlos.lopez@email.com'), (SELECT id_comite FROM Comite WHERE nombre_comite='Comité de Inteligencia Artificial'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='ana.garcia@email.com'), (SELECT id_comite FROM Comite WHERE nombre_comite='Comité de Ciberseguridad'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='javi.sq@email.com'), (SELECT id_comite FROM Comite WHERE nombre_comite='Comité de Ingeniería de Software'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='admin@admin.com'), (SELECT id_comite FROM Comite WHERE nombre_comite='Comité de Inteligencia Artificial'), 6)
ON CONFLICT DO NOTHING;

-- Proyectos de Investigación
INSERT INTO Proyectos_Investigacion (nombre_proyecto, descripcion, fecha_inicio, fecha_fin, estado)
VALUES 
    ('Detección de sesgos en LLMs', 'Proyecto para analizar y reducir discriminación en modelos masivos del lenguaje.', '2025-01-01', '2026-01-01', 'activo'),
    ('Seguridad en redes IoT', 'Estudio sobre vulnerabilidades modernas en dispositivos inteligentes domésticos.', '2024-06-01', '2025-06-01', 'activo'),
    ('Nuevo framewok Frontend', 'Investigación comparativa de rendimiento entre React, Vue y Svelte.', '2023-01-01', '2024-01-01', 'finalizado'),
    ('Machine Learning aplicado a la sanidad', 'Análisis predictivo de enfermedades usando historiales médicos.', '2025-03-01', '2027-03-01', 'activo')
ON CONFLICT DO NOTHING;

-- Miembros Proyecto
INSERT INTO Socio_Proyecto (fecha_registro, socio, proyecto, rol_proyecto)
VALUES 
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='laura.mart@email.com'), (SELECT id_proyecto FROM Proyectos_Investigacion WHERE nombre_proyecto='Detección de sesgos en LLMs'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='ana.garcia@email.com'), (SELECT id_proyecto FROM Proyectos_Investigacion WHERE nombre_proyecto='Seguridad en redes IoT'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='javi.sq@email.com'), (SELECT id_proyecto FROM Proyectos_Investigacion WHERE nombre_proyecto='Nuevo framewok Frontend'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='admin@admin.com'), (SELECT id_proyecto FROM Proyectos_Investigacion WHERE nombre_proyecto='Detección de sesgos en LLMs'), 7)
ON CONFLICT DO NOTHING;

-- Publicaciones
INSERT INTO Publicaciones (titulo, contenido, fecha_publicacion, socio)
VALUES 
    ('Avances en algoritmos cuánticos', 'El futuro de la computación está marcado por los bits cuánticos y su estabilización mediante nuevas estructuras.', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='admin@admin.com')),
    ('10 principios de seguridad sólida', 'Exploramos cómo evitar ataques de inyección y XSS en aplicaciones modernas mediante el uso de interceptores.', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='ana.garcia@email.com')),
    ('Impacto de IA generativa en la educación', 'La adaptación de los métodos de enseñanza ha sufrido cambios drásticos que requieren atención continua del profesorado.', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='laura.mart@email.com')),
    ('Eficiencia energética en centros de datos', 'Cómo optimizar el código desde el backend y usar edge computing para reducir emisiones de huella de carbono a gran escala.', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='carlos.lopez@email.com'));

-- Comentarios a publicaciones
INSERT INTO Comentario_Publicacion (comentario, socio, publicacion, fecha_comentario, visibilidad)
VALUES 
    ('Muy interesante el artículo, excelente aportación.', (SELECT id_socio FROM Socio WHERE email='laura.mart@email.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Avances en algoritmos cuánticos'), CURRENT_TIMESTAMP, true),
    ('Deberías incluir más referencias sobre RSA.', (SELECT id_socio FROM Socio WHERE email='admin@admin.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='10 principios de seguridad sólida'), CURRENT_TIMESTAMP, true),
    ('Totalmente de acuerdo, la docencia debe evolucionar rápidamente.', (SELECT id_socio FROM Socio WHERE email='javi.sq@email.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Impacto de IA generativa en la educación'), CURRENT_TIMESTAMP, true);

-- Eventos
INSERT INTO Evento (nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, direccion, comite)
VALUES 
    ('Congreso Nacional de IA 2026', '2026-09-10 09:00:00', '2026-09-12 18:00:00', 'El mayor evento de Inteligencia Artificial de España, reuniendo a cientos de expertos en deep learning y LLMs.', 
        (SELECT id_direccion FROM Direccion WHERE ciudad='Madrid' LIMIT 1), 
        (SELECT id_comite FROM Comite WHERE nombre_comite='Comité de Inteligencia Artificial')),
        
    ('Hackathon de Seguridad y Redes', '2026-11-20 10:00:00', '2026-11-22 20:00:00', 'Competición de hacking ético de 48 horas intensivas organizadas por equipos de Red y Blue team.', 
        (SELECT id_direccion FROM Direccion WHERE ciudad='Barcelona' LIMIT 1), 
        (SELECT id_comite FROM Comite WHERE nombre_comite='Comité de Ciberseguridad')),
        
    ('Charla: Arquitectura Limpia en Node', '2025-12-15 17:00:00', '2025-12-15 19:00:00', 'Charla sobre diseño de software orientado al dominio y a buenas prácticas estructurales en aplicaciones monolíticas.', 
        (SELECT id_direccion FROM Direccion WHERE ciudad='Sevilla' LIMIT 1), 
        (SELECT id_comite FROM Comite WHERE nombre_comite='Comité de Ingeniería de Software'));

-- Inscripciones a eventos
INSERT INTO Inscripciones (estado_inscripcion, evento, socio)
VALUES
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Congreso Nacional de IA 2026'), (SELECT id_socio FROM Socio WHERE email='admin@admin.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Congreso Nacional de IA 2026'), (SELECT id_socio FROM Socio WHERE email='laura.mart@email.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Hackathon de Seguridad y Redes'), (SELECT id_socio FROM Socio WHERE email='ana.garcia@email.com'))
ON CONFLICT DO NOTHING;


-- ==========================================
-- INSERCIÓN MASIVA (30+ DATOS POR TABLA)
-- ==========================================

-- Direcciones (30)
INSERT INTO Direccion(calle, ciudad, codigo_postal, provincia, latitud, longitud) VALUES 
    ('Calle Falsa 1', 'Ciudad 1', '00001', 'Provincia 1', 40.0, -3.0),
    ('Calle Falsa 2', 'Ciudad 2', '00002', 'Provincia 2', 40.0, -3.0),
    ('Calle Falsa 3', 'Ciudad 3', '00003', 'Provincia 3', 40.0, -3.0),
    ('Calle Falsa 4', 'Ciudad 4', '00004', 'Provincia 4', 40.0, -3.0),
    ('Calle Falsa 5', 'Ciudad 5', '00005', 'Provincia 0', 40.0, -3.0),
    ('Calle Falsa 6', 'Ciudad 6', '00006', 'Provincia 1', 40.0, -3.0),
    ('Calle Falsa 7', 'Ciudad 7', '00007', 'Provincia 2', 40.0, -3.0),
    ('Calle Falsa 8', 'Ciudad 8', '00008', 'Provincia 3', 40.0, -3.0),
    ('Calle Falsa 9', 'Ciudad 9', '00009', 'Provincia 4', 40.0, -3.0),
    ('Calle Falsa 10', 'Ciudad 10', '00010', 'Provincia 0', 40.0, -3.0),
    ('Calle Falsa 11', 'Ciudad 11', '00011', 'Provincia 1', 40.0, -3.0),
    ('Calle Falsa 12', 'Ciudad 12', '00012', 'Provincia 2', 40.0, -3.0),
    ('Calle Falsa 13', 'Ciudad 13', '00013', 'Provincia 3', 40.0, -3.0),
    ('Calle Falsa 14', 'Ciudad 14', '00014', 'Provincia 4', 40.0, -3.0),
    ('Calle Falsa 15', 'Ciudad 15', '00015', 'Provincia 0', 40.0, -3.0),
    ('Calle Falsa 16', 'Ciudad 16', '00016', 'Provincia 1', 40.0, -3.0),
    ('Calle Falsa 17', 'Ciudad 17', '00017', 'Provincia 2', 40.0, -3.0),
    ('Calle Falsa 18', 'Ciudad 18', '00018', 'Provincia 3', 40.0, -3.0),
    ('Calle Falsa 19', 'Ciudad 19', '00019', 'Provincia 4', 40.0, -3.0),
    ('Calle Falsa 20', 'Ciudad 20', '00020', 'Provincia 0', 40.0, -3.0),
    ('Calle Falsa 21', 'Ciudad 21', '00021', 'Provincia 1', 40.0, -3.0),
    ('Calle Falsa 22', 'Ciudad 22', '00022', 'Provincia 2', 40.0, -3.0),
    ('Calle Falsa 23', 'Ciudad 23', '00023', 'Provincia 3', 40.0, -3.0),
    ('Calle Falsa 24', 'Ciudad 24', '00024', 'Provincia 4', 40.0, -3.0),
    ('Calle Falsa 25', 'Ciudad 25', '00025', 'Provincia 0', 40.0, -3.0),
    ('Calle Falsa 26', 'Ciudad 26', '00026', 'Provincia 1', 40.0, -3.0),
    ('Calle Falsa 27', 'Ciudad 27', '00027', 'Provincia 2', 40.0, -3.0),
    ('Calle Falsa 28', 'Ciudad 28', '00028', 'Provincia 3', 40.0, -3.0),
    ('Calle Falsa 29', 'Ciudad 29', '00029', 'Provincia 4', 40.0, -3.0),
    ('Calle Falsa 30', 'Ciudad 30', '00030', 'Provincia 0', 40.0, -3.0)
ON CONFLICT DO NOTHING;

-- Socios (30)
INSERT INTO Socio (nombre, apellidos, email, password, telefono, fecha_nacimiento, fecha_alta, fecha_expiracion, socio_rol, tipo_socio) VALUES 
    ('Usuario1', 'Apellido1', 'user1@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000001', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 2),
    ('Usuario2', 'Apellido2', 'user2@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000002', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Usuario3', 'Apellido3', 'user3@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000003', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 1),
    ('Usuario4', 'Apellido4', 'user4@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000004', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 2),
    ('Usuario5', 'Apellido5', 'user5@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000005', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Usuario6', 'Apellido6', 'user6@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000006', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 1),
    ('Usuario7', 'Apellido7', 'user7@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000007', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 2),
    ('Usuario8', 'Apellido8', 'user8@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000008', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Usuario9', 'Apellido9', 'user9@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000009', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 1),
    ('Usuario10', 'Apellido10', 'user10@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000010', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 2),
    ('Usuario11', 'Apellido11', 'user11@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000011', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Usuario12', 'Apellido12', 'user12@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000012', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 1),
    ('Usuario13', 'Apellido13', 'user13@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000013', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 2),
    ('Usuario14', 'Apellido14', 'user14@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000014', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Usuario15', 'Apellido15', 'user15@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000015', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 1),
    ('Usuario16', 'Apellido16', 'user16@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000016', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 2),
    ('Usuario17', 'Apellido17', 'user17@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000017', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Usuario18', 'Apellido18', 'user18@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000018', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 1),
    ('Usuario19', 'Apellido19', 'user19@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000019', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 2),
    ('Usuario20', 'Apellido20', 'user20@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000020', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Usuario21', 'Apellido21', 'user21@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000021', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 1),
    ('Usuario22', 'Apellido22', 'user22@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000022', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 2),
    ('Usuario23', 'Apellido23', 'user23@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000023', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Usuario24', 'Apellido24', 'user24@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000024', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 1),
    ('Usuario25', 'Apellido25', 'user25@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000025', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 2),
    ('Usuario26', 'Apellido26', 'user26@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000026', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Usuario27', 'Apellido27', 'user27@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000027', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 1),
    ('Usuario28', 'Apellido28', 'user28@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000028', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 2),
    ('Usuario29', 'Apellido29', 'user29@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000029', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 3),
    ('Usuario30', 'Apellido30', 'user30@test.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '600000030', '1990-01-01 00:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 8, 1)
ON CONFLICT (email) DO NOTHING;

-- Comites (30)
INSERT INTO Comite (nombre_comite, descripcion, fecha_creacion) VALUES 
    ('Comité de Prueba 1', 'Descripción para el comité 1.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 2', 'Descripción para el comité 2.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 3', 'Descripción para el comité 3.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 4', 'Descripción para el comité 4.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 5', 'Descripción para el comité 5.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 6', 'Descripción para el comité 6.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 7', 'Descripción para el comité 7.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 8', 'Descripción para el comité 8.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 9', 'Descripción para el comité 9.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 10', 'Descripción para el comité 10.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 11', 'Descripción para el comité 11.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 12', 'Descripción para el comité 12.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 13', 'Descripción para el comité 13.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 14', 'Descripción para el comité 14.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 15', 'Descripción para el comité 15.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 16', 'Descripción para el comité 16.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 17', 'Descripción para el comité 17.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 18', 'Descripción para el comité 18.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 19', 'Descripción para el comité 19.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 20', 'Descripción para el comité 20.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 21', 'Descripción para el comité 21.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 22', 'Descripción para el comité 22.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 23', 'Descripción para el comité 23.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 24', 'Descripción para el comité 24.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 25', 'Descripción para el comité 25.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 26', 'Descripción para el comité 26.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 27', 'Descripción para el comité 27.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 28', 'Descripción para el comité 28.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 29', 'Descripción para el comité 29.', CURRENT_TIMESTAMP),
    ('Comité de Prueba 30', 'Descripción para el comité 30.', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Miembros de Comite (30)
INSERT INTO Miembros_Comite (fecha_registro, socio, comite, rol_comite) VALUES 
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user1@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 1'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user2@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 2'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user3@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 3'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user4@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 4'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user5@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 5'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user6@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 6'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user7@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 7'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user8@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 8'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user9@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 9'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user10@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 10'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user11@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 11'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user12@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 12'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user13@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 13'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user14@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 14'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user15@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 15'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user16@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 16'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user17@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 17'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user18@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 18'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user19@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 19'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user20@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 20'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user21@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 21'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user22@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 22'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user23@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 23'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user24@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 24'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user25@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 25'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user26@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 26'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user27@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 27'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user28@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 28'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user29@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 29'), 6),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user30@test.com'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 30'), 6)
ON CONFLICT DO NOTHING;

-- Proyectos de Investigacion (30)
INSERT INTO Proyectos_Investigacion (nombre_proyecto, descripcion, fecha_inicio, fecha_fin, estado) VALUES 
    ('Proyecto de Investigación 1', 'Descripción extensa del proyecto 1...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 2', 'Descripción extensa del proyecto 2...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 3', 'Descripción extensa del proyecto 3...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 4', 'Descripción extensa del proyecto 4...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 5', 'Descripción extensa del proyecto 5...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 6', 'Descripción extensa del proyecto 6...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 7', 'Descripción extensa del proyecto 7...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 8', 'Descripción extensa del proyecto 8...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 9', 'Descripción extensa del proyecto 9...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 10', 'Descripción extensa del proyecto 10...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 11', 'Descripción extensa del proyecto 11...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 12', 'Descripción extensa del proyecto 12...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 13', 'Descripción extensa del proyecto 13...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 14', 'Descripción extensa del proyecto 14...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 15', 'Descripción extensa del proyecto 15...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 16', 'Descripción extensa del proyecto 16...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 17', 'Descripción extensa del proyecto 17...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 18', 'Descripción extensa del proyecto 18...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 19', 'Descripción extensa del proyecto 19...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 20', 'Descripción extensa del proyecto 20...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 21', 'Descripción extensa del proyecto 21...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 22', 'Descripción extensa del proyecto 22...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 23', 'Descripción extensa del proyecto 23...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 24', 'Descripción extensa del proyecto 24...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 25', 'Descripción extensa del proyecto 25...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 26', 'Descripción extensa del proyecto 26...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 27', 'Descripción extensa del proyecto 27...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 28', 'Descripción extensa del proyecto 28...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 29', 'Descripción extensa del proyecto 29...', '2025-01-01', '2026-01-01', 'activo'),
    ('Proyecto de Investigación 30', 'Descripción extensa del proyecto 30...', '2025-01-01', '2026-01-01', 'activo')
ON CONFLICT DO NOTHING;

-- Miembros Proyecto (30)
INSERT INTO Socio_Proyecto (fecha_registro, socio, proyecto, rol_proyecto) VALUES 
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user1@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 1'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user2@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 2'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user3@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 3'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user4@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 4'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user5@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 5'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user6@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 6'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user7@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 7'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user8@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 8'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user9@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 9'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user10@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 10'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user11@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 11'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user12@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 12'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user13@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 13'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user14@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 14'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user15@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 15'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user16@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 16'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user17@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 17'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user18@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 18'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user19@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 19'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user20@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 20'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user21@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 21'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user22@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 22'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user23@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 23'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user24@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 24'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user25@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 25'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user26@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 26'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user27@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 27'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user28@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 28'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user29@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 29'), 7),
    (CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user30@test.com'), (SELECT MAX(id_proyecto) FROM Proyectos_Investigacion WHERE nombre_proyecto LIKE 'Proyecto de Investigación 30'), 7)
ON CONFLICT DO NOTHING;

-- Publicaciones (30)
INSERT INTO Publicaciones (titulo, contenido, fecha_publicacion, socio) VALUES 
    ('Publicación Científica 1', 'El contenido de esta publicación 1 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user1@test.com')),
    ('Publicación Científica 2', 'El contenido de esta publicación 2 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user2@test.com')),
    ('Publicación Científica 3', 'El contenido de esta publicación 3 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user3@test.com')),
    ('Publicación Científica 4', 'El contenido de esta publicación 4 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user4@test.com')),
    ('Publicación Científica 5', 'El contenido de esta publicación 5 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user5@test.com')),
    ('Publicación Científica 6', 'El contenido de esta publicación 6 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user6@test.com')),
    ('Publicación Científica 7', 'El contenido de esta publicación 7 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user7@test.com')),
    ('Publicación Científica 8', 'El contenido de esta publicación 8 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user8@test.com')),
    ('Publicación Científica 9', 'El contenido de esta publicación 9 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user9@test.com')),
    ('Publicación Científica 10', 'El contenido de esta publicación 10 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user10@test.com')),
    ('Publicación Científica 11', 'El contenido de esta publicación 11 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user11@test.com')),
    ('Publicación Científica 12', 'El contenido de esta publicación 12 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user12@test.com')),
    ('Publicación Científica 13', 'El contenido de esta publicación 13 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user13@test.com')),
    ('Publicación Científica 14', 'El contenido de esta publicación 14 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user14@test.com')),
    ('Publicación Científica 15', 'El contenido de esta publicación 15 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user15@test.com')),
    ('Publicación Científica 16', 'El contenido de esta publicación 16 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user16@test.com')),
    ('Publicación Científica 17', 'El contenido de esta publicación 17 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user17@test.com')),
    ('Publicación Científica 18', 'El contenido de esta publicación 18 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user18@test.com')),
    ('Publicación Científica 19', 'El contenido de esta publicación 19 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user19@test.com')),
    ('Publicación Científica 20', 'El contenido de esta publicación 20 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user20@test.com')),
    ('Publicación Científica 21', 'El contenido de esta publicación 21 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user21@test.com')),
    ('Publicación Científica 22', 'El contenido de esta publicación 22 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user22@test.com')),
    ('Publicación Científica 23', 'El contenido de esta publicación 23 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user23@test.com')),
    ('Publicación Científica 24', 'El contenido de esta publicación 24 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user24@test.com')),
    ('Publicación Científica 25', 'El contenido de esta publicación 25 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user25@test.com')),
    ('Publicación Científica 26', 'El contenido de esta publicación 26 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user26@test.com')),
    ('Publicación Científica 27', 'El contenido de esta publicación 27 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user27@test.com')),
    ('Publicación Científica 28', 'El contenido de esta publicación 28 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user28@test.com')),
    ('Publicación Científica 29', 'El contenido de esta publicación 29 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user29@test.com')),
    ('Publicación Científica 30', 'El contenido de esta publicación 30 se centra en...', CURRENT_TIMESTAMP, (SELECT id_socio FROM Socio WHERE email='user30@test.com'));

-- Comentarios a publicaciones (30)
INSERT INTO Comentario_Publicacion (comentario, socio, publicacion, fecha_comentario, visibilidad) VALUES 
    ('Comentario de prueba 1', (SELECT id_socio FROM Socio WHERE email='user2@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 1'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 2', (SELECT id_socio FROM Socio WHERE email='user3@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 2'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 3', (SELECT id_socio FROM Socio WHERE email='user4@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 3'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 4', (SELECT id_socio FROM Socio WHERE email='user5@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 4'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 5', (SELECT id_socio FROM Socio WHERE email='user6@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 5'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 6', (SELECT id_socio FROM Socio WHERE email='user7@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 6'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 7', (SELECT id_socio FROM Socio WHERE email='user8@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 7'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 8', (SELECT id_socio FROM Socio WHERE email='user9@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 8'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 9', (SELECT id_socio FROM Socio WHERE email='user10@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 9'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 10', (SELECT id_socio FROM Socio WHERE email='user11@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 10'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 11', (SELECT id_socio FROM Socio WHERE email='user12@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 11'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 12', (SELECT id_socio FROM Socio WHERE email='user13@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 12'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 13', (SELECT id_socio FROM Socio WHERE email='user14@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 13'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 14', (SELECT id_socio FROM Socio WHERE email='user15@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 14'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 15', (SELECT id_socio FROM Socio WHERE email='user16@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 15'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 16', (SELECT id_socio FROM Socio WHERE email='user17@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 16'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 17', (SELECT id_socio FROM Socio WHERE email='user18@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 17'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 18', (SELECT id_socio FROM Socio WHERE email='user19@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 18'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 19', (SELECT id_socio FROM Socio WHERE email='user20@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 19'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 20', (SELECT id_socio FROM Socio WHERE email='user21@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 20'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 21', (SELECT id_socio FROM Socio WHERE email='user22@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 21'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 22', (SELECT id_socio FROM Socio WHERE email='user23@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 22'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 23', (SELECT id_socio FROM Socio WHERE email='user24@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 23'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 24', (SELECT id_socio FROM Socio WHERE email='user25@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 24'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 25', (SELECT id_socio FROM Socio WHERE email='user26@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 25'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 26', (SELECT id_socio FROM Socio WHERE email='user27@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 26'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 27', (SELECT id_socio FROM Socio WHERE email='user28@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 27'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 28', (SELECT id_socio FROM Socio WHERE email='user29@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 28'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 29', (SELECT id_socio FROM Socio WHERE email='user30@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 29'), CURRENT_TIMESTAMP, true),
    ('Comentario de prueba 30', (SELECT id_socio FROM Socio WHERE email='user1@test.com'), (SELECT MAX(id_publicacion) FROM Publicaciones WHERE titulo='Publicación Científica 30'), CURRENT_TIMESTAMP, true);

-- Eventos (30)
INSERT INTO Evento (nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, direccion, comite) VALUES 
    ('Gran Evento 1', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 1', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 1'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 1')),
    ('Gran Evento 2', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 2', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 2'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 2')),
    ('Gran Evento 3', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 3', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 3'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 3')),
    ('Gran Evento 4', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 4', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 4'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 4')),
    ('Gran Evento 5', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 5', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 5'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 5')),
    ('Gran Evento 6', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 6', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 6'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 6')),
    ('Gran Evento 7', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 7', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 7'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 7')),
    ('Gran Evento 8', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 8', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 8'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 8')),
    ('Gran Evento 9', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 9', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 9'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 9')),
    ('Gran Evento 10', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 10', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 10'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 10')),
    ('Gran Evento 11', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 11', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 11'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 11')),
    ('Gran Evento 12', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 12', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 12'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 12')),
    ('Gran Evento 13', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 13', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 13'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 13')),
    ('Gran Evento 14', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 14', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 14'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 14')),
    ('Gran Evento 15', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 15', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 15'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 15')),
    ('Gran Evento 16', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 16', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 16'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 16')),
    ('Gran Evento 17', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 17', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 17'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 17')),
    ('Gran Evento 18', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 18', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 18'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 18')),
    ('Gran Evento 19', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 19', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 19'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 19')),
    ('Gran Evento 20', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 20', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 20'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 20')),
    ('Gran Evento 21', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 21', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 21'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 21')),
    ('Gran Evento 22', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 22', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 22'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 22')),
    ('Gran Evento 23', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 23', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 23'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 23')),
    ('Gran Evento 24', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 24', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 24'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 24')),
    ('Gran Evento 25', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 25', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 25'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 25')),
    ('Gran Evento 26', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 26', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 26'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 26')),
    ('Gran Evento 27', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 27', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 27'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 27')),
    ('Gran Evento 28', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 28', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 28'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 28')),
    ('Gran Evento 29', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 29', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 29'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 29')),
    ('Gran Evento 30', '2026-10-01 10:00:00', '2026-10-02 20:00:00', 'Descripción del evento número 30', (SELECT MAX(id_direccion) FROM Direccion WHERE ciudad='Ciudad 30'), (SELECT MAX(id_comite) FROM Comite WHERE nombre_comite LIKE 'Comité de Prueba 30'));

-- Inscripciones a eventos (30)
INSERT INTO Inscripciones (estado_inscripcion, evento, socio) VALUES 
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 1'), (SELECT id_socio FROM Socio WHERE email='user1@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 2'), (SELECT id_socio FROM Socio WHERE email='user2@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 3'), (SELECT id_socio FROM Socio WHERE email='user3@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 4'), (SELECT id_socio FROM Socio WHERE email='user4@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 5'), (SELECT id_socio FROM Socio WHERE email='user5@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 6'), (SELECT id_socio FROM Socio WHERE email='user6@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 7'), (SELECT id_socio FROM Socio WHERE email='user7@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 8'), (SELECT id_socio FROM Socio WHERE email='user8@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 9'), (SELECT id_socio FROM Socio WHERE email='user9@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 10'), (SELECT id_socio FROM Socio WHERE email='user10@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 11'), (SELECT id_socio FROM Socio WHERE email='user11@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 12'), (SELECT id_socio FROM Socio WHERE email='user12@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 13'), (SELECT id_socio FROM Socio WHERE email='user13@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 14'), (SELECT id_socio FROM Socio WHERE email='user14@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 15'), (SELECT id_socio FROM Socio WHERE email='user15@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 16'), (SELECT id_socio FROM Socio WHERE email='user16@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 17'), (SELECT id_socio FROM Socio WHERE email='user17@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 18'), (SELECT id_socio FROM Socio WHERE email='user18@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 19'), (SELECT id_socio FROM Socio WHERE email='user19@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 20'), (SELECT id_socio FROM Socio WHERE email='user20@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 21'), (SELECT id_socio FROM Socio WHERE email='user21@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 22'), (SELECT id_socio FROM Socio WHERE email='user22@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 23'), (SELECT id_socio FROM Socio WHERE email='user23@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 24'), (SELECT id_socio FROM Socio WHERE email='user24@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 25'), (SELECT id_socio FROM Socio WHERE email='user25@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 26'), (SELECT id_socio FROM Socio WHERE email='user26@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 27'), (SELECT id_socio FROM Socio WHERE email='user27@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 28'), (SELECT id_socio FROM Socio WHERE email='user28@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 29'), (SELECT id_socio FROM Socio WHERE email='user29@test.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Gran Evento 30'), (SELECT id_socio FROM Socio WHERE email='user30@test.com'))
ON CONFLICT DO NOTHING;
