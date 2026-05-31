require('dotenv').config({ path: '.env.development' });
const pool = require('./src/database');

async function migrate() {
    try {
        console.log("Iniciando migración definitiva...");

        // Eventos
        console.log("Modificando tabla 'evento'...");
        await pool.query('ALTER TABLE "evento" ADD COLUMN IF NOT EXISTS slug VARCHAR(256) UNIQUE;');
        const resEnv = await pool.query('SELECT id_evento, nombre_evento FROM "evento"');
        for (const row of resEnv.rows) {
            const s = (row.nombre_evento || 'evento').toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-");
            await pool.query('UPDATE "evento" SET slug = $1 WHERE id_evento = $2', [s, row.id_evento]);
            console.log(`  - Evento: ${s}`);
        }

        // Articulos (Publicaciones)
        console.log("\nModificando tabla 'publicaciones'...");
        await pool.query('ALTER TABLE "publicaciones" ADD COLUMN IF NOT EXISTS slug VARCHAR(256) UNIQUE;');
        const resPub = await pool.query('SELECT id_publicacion, titulo FROM "publicaciones"');
        for (const row of resPub.rows) {
            const s = (row.titulo || 'art').toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-");
            await pool.query('UPDATE "publicaciones" SET slug = $1 WHERE id_publicacion = $2', [s, row.id_publicacion]);
            console.log(`  - Publicacion: ${s}`);
        }

        // Proyectos
        console.log("\nModificando tabla 'proyectos_investigacion'...");
        await pool.query('ALTER TABLE "proyectos_investigacion" ADD COLUMN IF NOT EXISTS slug VARCHAR(256) UNIQUE;');
        const resProy = await pool.query('SELECT id_proyecto, nombre_proyecto FROM "proyectos_investigacion"');
        for (const row of resProy.rows) {
            const s = (row.nombre_proyecto || 'proy').toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-");
            await pool.query('UPDATE "proyectos_investigacion" SET slug = $1 WHERE id_proyecto = $2', [s, row.id_proyecto]);
            console.log(`  - Proyecto: ${s}`);
        }

        console.log("\n¡Migración finalizada con éxito!");
    } catch (err) {
        console.error("Error en migración:", err);
    } finally {
        process.exit();
    }
}

migrate();
