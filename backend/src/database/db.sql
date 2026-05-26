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
    precio FLOAT DEFAULT 0,
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
    payment_intent_id VARCHAR(255),
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
INSERT INTO Socio (nombre, apellidos, email, password, telefono, fecha_nacimiento, fecha_alta, fecha_expiracion, socio_rol, tipo_socio) 
VALUES 
    ('admin', 'admin', 'admin@admin.com', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '123456789', '2001-11-03 00:00:00', '2025-05-10 15:37:21.561', '3000-05-10 15:37:21.561', 1, 1),
    ('Ángel', 'Cardoso Parreño', 'acp171@gcloud.ua.es', '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', '123456789', '2001-11-03 00:00:00', '2025-05-10 15:37:21.561', '3000-05-10 15:37:21.561', 8, 2);

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
INSERT INTO Evento (nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, precio, direccion, comite)
VALUES 
    ('Congreso Nacional de IA 2026', '2026-09-10 09:00:00', '2026-09-12 18:00:00', 'El mayor evento de Inteligencia Artificial de España, reuniendo a cientos de expertos en deep learning y LLMs.', 50.00,
        (SELECT id_direccion FROM Direccion WHERE ciudad='Madrid' LIMIT 1), 
        (SELECT id_comite FROM Comite WHERE nombre_comite='Comité de Inteligencia Artificial')),
        
    ('Hackathon de Seguridad y Redes', '2026-11-20 10:00:00', '2026-11-22 20:00:00', 'Competición de hacking ético de 48 horas intensivas organizadas por equipos de Red y Blue team.', 20.00,
        (SELECT id_direccion FROM Direccion WHERE ciudad='Barcelona' LIMIT 1), 
        (SELECT id_comite FROM Comite WHERE nombre_comite='Comité de Ciberseguridad')),
        
    ('Charla: Arquitectura Limpia en Node', '2025-12-15 17:00:00', '2025-12-15 19:00:00', 'Charla sobre diseño de software orientado al dominio y a buenas prácticas estructurales en aplicaciones monolíticas.', 0.00,
        (SELECT id_direccion FROM Direccion WHERE ciudad='Sevilla' LIMIT 1), 
        (SELECT id_comite FROM Comite WHERE nombre_comite='Comité de Ingeniería de Software'));

-- Inscripciones a eventos
INSERT INTO Inscripciones (estado_inscripcion, evento, socio)
VALUES
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Congreso Nacional de IA 2026'), (SELECT id_socio FROM Socio WHERE email='admin@admin.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Congreso Nacional de IA 2026'), (SELECT id_socio FROM Socio WHERE email='laura.mart@email.com')),
    ('pagado', (SELECT MAX(id_evento) FROM Evento WHERE nombre_evento='Hackathon de Seguridad y Redes'), (SELECT id_socio FROM Socio WHERE email='ana.garcia@email.com'))
ON CONFLICT DO NOTHING;