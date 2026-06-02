#!/usr/bin/env node
/**
 * list-routes.js — Imprime todas las rutas del backend de forma visual y coloreada.
 * Uso: node list-routes.js (desde la carpeta backend/)
 */

const fs   = require('fs');
const path = require('path');

// ── ANSI colors ────────────────────────────────────────────────────────────────
const R = '\x1b[0m';
const BOLD  = '\x1b[1m';
const DIM   = '\x1b[2m';
const colors = {
  GET:    '\x1b[32m',  // green
  POST:   '\x1b[34m',  // blue
  PUT:    '\x1b[33m',  // yellow
  PATCH:  '\x1b[35m',  // magenta
  DELETE: '\x1b[31m',  // red
};

// ── Auth badge ─────────────────────────────────────────────────────────────────
function authBadge(line) {
  if (line.includes('verificarSuscripcionActiva')) return `\x1b[33m[🔐 suscripción]${R}`;
  if (line.includes('verificarToken'))             return `\x1b[36m[🔑 token]${R}`;
  return `${DIM}[público]${R}`;
}

// ── Module grouping ─────────────────────────────────────────────────────────────
const groups = {
  'Autenticación':  ['/login', '/register', '/auth/'],
  'Perfil/Socios':  ['/perfil', '/socios/', '/corporacion/', '/renovar-suscripcion'],
  'Artículos':      ['/articulos-cientificos', '/listado-articulos'],
  'Eventos':        ['/eventos-cientificos', '/listado-eventos', '/incripciones/'],
  'Proyectos':      ['/proyectos-investigacion', '/listado-proyectos'],
  'Comités':        ['/comites/', '/crear-comite', '/add-miembro-comite', '/eliminar-miembro-comite'],
  'Notificaciones': ['/notificacion', '/listado-notificacion'],
  'Administración': ['/roles', '/tipos', '/asignar-rol', '/eliminar-rol', '/buscar-calles'],
  'Webhooks':       ["router.post('/',"],
};

function getGroup(line) {
  for (const [group, patterns] of Object.entries(groups)) {
    if (patterns.some(p => line.includes(p))) return group;
  }
  return 'Otros';
}

// ── Parse routes ───────────────────────────────────────────────────────────────
const routesDir = path.join(__dirname, 'src', 'routes');
const lines = [];

for (const file of fs.readdirSync(routesDir)) {
  if (!file.endsWith('.js')) continue;
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/router\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/i);
    if (m) lines.push({ method: m[1].toUpperCase(), route: m[2], raw: line.trim() });
  }
}

// ── Sort by group ──────────────────────────────────────────────────────────────
const grouped = {};
for (const entry of lines) {
  const g = getGroup(entry.raw);
  if (!grouped[g]) grouped[g] = [];
  grouped[g].push(entry);
}

// ── Print ──────────────────────────────────────────────────────────────────────
const WIDTH = 72;
console.log('\n' + BOLD + '═'.repeat(WIDTH) + R);
console.log(BOLD + '  🗺️  SCDI Backend — Mapa de Rutas API' + R);
console.log(BOLD + '═'.repeat(WIDTH) + R);

for (const [group, entries] of Object.entries(grouped)) {
  console.log(`\n  ${BOLD}▶  ${group}${R}`);
  console.log('  ' + '─'.repeat(WIDTH - 2));

  for (const { method, route, raw } of entries) {
    const col   = colors[method] || '';
    const badge = `${col}${BOLD} ${method.padEnd(6)} ${R}`;
    const auth  = authBadge(raw);
    console.log(`  ${badge} ${route.padEnd(50)} ${auth}`);
  }
}

console.log('\n' + BOLD + '═'.repeat(WIDTH) + R);
console.log(`  Total: ${BOLD}${lines.length} endpoints${R} en ${BOLD}${Object.keys(grouped).length} módulos${R}`);
console.log(BOLD + '═'.repeat(WIDTH) + R + '\n');
