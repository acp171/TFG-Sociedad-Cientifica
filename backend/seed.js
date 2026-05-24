require('dotenv').config({ path: '.env.development' });
const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  console.log("🌱 Iniciando inserción masiva de semillas realistas (30+ por tabla)...");

  try {
    // 1. Crear Direcciones
    console.log("Generando 30 Direcciones...");
    const direccionesIds = [];
    for (let i = 0; i < 30; i++) {
      const result = await pool.query(`
        INSERT INTO Direccion(calle, ciudad, codigo_postal, provincia, latitud, longitud) 
        VALUES($1, $2, $3, $4, $5, $6) RETURNING id_direccion;
      `, [
        faker.location.streetAddress(),
        faker.location.city(),
        faker.location.zipCode('#####'),
        faker.location.state(),
        faker.location.latitude(),
        faker.location.longitude()
      ]);
      direccionesIds.push(result.rows[0].id_direccion);
    }

    // 2. Crear Socios
    console.log("Generando 30 Socios...");
    const sociosIds = [];
    const rolesSocio = [1, 2, 3, 4, 5, 8];
    for (let i = 0; i < 30; i++) {
      const email = faker.internet.email();
      const result = await pool.query(`
        INSERT INTO Socio(nombre, apellidos, email, password, telefono, fecha_nacimiento, fecha_alta, fecha_expiracion, socio_rol, tipo_socio) 
        VALUES($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', $7, $8) RETURNING id_socio;
      `, [
        faker.person.firstName(),
        faker.person.lastName(),
        email,
        '$2a$12$jb4zKaou5JP7lBA5F1.JC.TDDi1.mGxC164/HETc5WNtWnmozxM3y', // 'admin'
        '6' + faker.string.numeric(8),
        faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        faker.helpers.arrayElement(rolesSocio),
        faker.number.int({ min: 1, max: 6 })
      ]);
      sociosIds.push(result.rows[0].id_socio);
    }

    // 3. Crear Comités
    console.log("Generando 30 Comités...");
    const comitesIds = [];
    for (let i = 0; i < 30; i++) {
      const result = await pool.query(`
        INSERT INTO Comite(nombre_comite, descripcion, fecha_creacion) 
        VALUES($1, $2, CURRENT_TIMESTAMP) RETURNING id_comite;
      `, [
        faker.company.catchPhrase(),
        faker.lorem.paragraph()
      ]);
      comitesIds.push(result.rows[0].id_comite);
    }

    // 4. Asignar Miembros a Comités
    console.log("Asignando Miembros a Comités...");
    for (let i = 0; i < 60; i++) {
        await pool.query(`
          INSERT INTO Miembros_Comite(fecha_registro, socio, comite, rol_comite) 
          VALUES(CURRENT_TIMESTAMP, $1, $2, 6)
          ON CONFLICT DO NOTHING;
        `, [
          faker.helpers.arrayElement(sociosIds),
          faker.helpers.arrayElement(comitesIds)
        ]);
    }

    // 5. Crear Proyectos
    console.log("Generando 30 Proyectos de Investigación...");
    const proyectosIds = [];
    for (let i = 0; i < 30; i++) {
      const result = await pool.query(`
        INSERT INTO Proyectos_Investigacion(nombre_proyecto, descripcion, fecha_inicio, fecha_fin, estado) 
        VALUES($1, $2, $3, $4, $5) RETURNING id_proyecto;
      `, [
        faker.commerce.productName() + ' Research',
        faker.lorem.paragraphs(2),
        faker.date.past(),
        faker.date.future(),
        faker.helpers.arrayElement(['activo', 'finalizado', 'pausado'])
      ]);
      proyectosIds.push(result.rows[0].id_proyecto);
    }

    // 6. Asignar Socios a Proyectos
    console.log("Asignando Socios a Proyectos...");
    for (let i = 0; i < 80; i++) {
        await pool.query(`
          INSERT INTO Socio_Proyecto(fecha_registro, socio, proyecto, rol_proyecto) 
          VALUES(CURRENT_TIMESTAMP, $1, $2, 7)
          ON CONFLICT DO NOTHING;
        `, [
          faker.helpers.arrayElement(sociosIds),
          faker.helpers.arrayElement(proyectosIds)
        ]);
    }

    // 7. Crear Publicaciones
    console.log("Generando 30 Publicaciones...");
    const pubIds = [];
    for (let i = 0; i < 30; i++) {
      const result = await pool.query(`
        INSERT INTO Publicaciones(titulo, contenido, fecha_publicacion, socio) 
        VALUES($1, $2, CURRENT_TIMESTAMP, $3) RETURNING id_publicacion;
      `, [
        faker.company.catchPhrase(),
        faker.lorem.text(),
        faker.helpers.arrayElement(sociosIds)
      ]);
      pubIds.push(result.rows[0].id_publicacion);
    }

    // 8. Crear Comentarios
    console.log("Generando 30 Comentarios...");
    for (let i = 0; i < 30; i++) {
      await pool.query(`
        INSERT INTO Comentario_Publicacion(comentario, socio, publicacion, fecha_comentario, visibilidad) 
        VALUES($1, $2, $3, CURRENT_TIMESTAMP, true);
      `, [
        faker.lorem.sentence(),
        faker.helpers.arrayElement(sociosIds),
        faker.helpers.arrayElement(pubIds)
      ]);
    }

    // 9. Crear Eventos
    console.log("Generando 30 Eventos...");
    const eventosIds = [];
    for (let i = 0; i < 30; i++) {
      const result = await pool.query(`
        INSERT INTO Evento(nombre_evento, fecha_evento_inicio, fecha_evento_fin, descripcion_evento, direccion, comite) 
        VALUES($1, $2, $3, $4, $5, $6) RETURNING id_evento;
      `, [
        faker.company.name() + ' Conference',
        faker.date.recent(),
        faker.date.soon(),
        faker.lorem.paragraph(),
        faker.helpers.arrayElement(direccionesIds),
        faker.helpers.arrayElement(comitesIds)
      ]);
      eventosIds.push(result.rows[0].id_evento);
    }

    // 10. Inscripciones
    console.log("Generando Inscripciones a Eventos...");
    for (let i = 0; i < 60; i++) {
      await pool.query(`
        INSERT INTO Inscripciones(estado_inscripcion, evento, socio) 
        VALUES('pagado', $1, $2)
        ON CONFLICT DO NOTHING;
      `, [
        faker.helpers.arrayElement(eventosIds),
        faker.helpers.arrayElement(sociosIds)
      ]);
    }

    console.log("✅ ¡Base de datos rellenada exitosamente con datos realistas!");
  } catch (e) {
    console.error("❌ Error generando semillas:", e);
  } finally {
    await pool.end();
  }
}

main();
