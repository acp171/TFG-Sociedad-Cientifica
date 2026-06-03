import API_BASE_URL from '../config/backendConfig';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CalendarIcon = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const ClockIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

function getDaysUntil(dateStr) {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
}

const EventosSection = () => {
    const { t } = useTranslation();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/listado-eventos-cientificos`)
            .then(res => res.json())
            .then(data => {
                // Sort by date ascending and pick upcoming events first
                const lista = (data.eventos?.listaEventos || []);
                const sorted = lista.sort((a, b) =>
                    new Date(a.fecha_evento_inicio) - new Date(b.fecha_evento_inicio)
                );
                setEventos(sorted);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error al obtener eventos:', err);
                setLoading(false);
            });
    }, []);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    };

    return (
        <section style={{ padding: '80px 0', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                    <span style={{
                        display: 'inline-block', background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
                        padding: '6px 18px', borderRadius: '100px', fontSize: '13px', fontWeight: 700,
                        letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px',
                    }}>
                        Agenda
                    </span>
                    <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: 'white', margin: '0 0 12px', lineHeight: 1.2 }}>
                        {t('home.proximos_eventos')}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '520px', margin: '0 auto' }}>
                        Participa en los próximos eventos científicos de nuestra comunidad.
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} style={{
                                height: '96px', background: 'rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                            }} />
                        ))}
                    </div>
                ) : eventos.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '16px' }}>{t('home.no_eventos')}</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {eventos.slice(0, 4).map((evento, i) => {
                            const daysUntil = getDaysUntil(evento.fecha_evento_inicio);
                            const isPast = daysUntil < 0;
                            const isToday = daysUntil === 0;
                            const isSoon = daysUntil > 0 && daysUntil <= 7;

                            let badge = null;
                            if (isPast) badge = { label: 'Finalizado', color: '#64748b', bg: 'rgba(100,116,139,0.15)' };
                            else if (isToday) badge = { label: '¡Hoy!', color: '#f59e0b', bg: 'rgba(245,158,11,0.2)' };
                            else if (isSoon) badge = { label: `En ${daysUntil}d`, color: '#10b981', bg: 'rgba(16,185,129,0.15)' };
                            else badge = { label: `En ${daysUntil}d`, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' };

                            return (
                                <Link
                                    key={evento.id_evento}
                                    to={`/eventos-cientificos/${evento.slug || evento.id_evento}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '16px',
                                        padding: '20px 24px',
                                        transition: 'background 0.2s ease, border-color 0.2s ease',
                                        cursor: 'pointer',
                                        flexWrap: 'wrap',
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                        }}
                                    >
                                        {/* Index number */}
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0,
                                        }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </div>

                                        {/* Event info */}
                                        <div style={{ flex: 1, minWidth: '160px' }}>
                                            <span style={{
                                                color: 'white', fontSize: '16px', fontWeight: 600,
                                                display: 'block', marginBottom: '6px',
                                            }}>
                                                {evento.nombre_evento}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                                <span style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <CalendarIcon /> {formatDate(evento.fecha_evento_inicio)}
                                                </span>
                                                <span style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <ClockIcon /> {formatTime(evento.fecha_evento_inicio)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Badge */}
                                        <div style={{
                                            background: badge.bg, color: badge.color,
                                            padding: '5px 14px', borderRadius: '100px',
                                            fontSize: '12px', fontWeight: 700, flexShrink: 0,
                                        }}>
                                            {badge.label}
                                        </div>

                                        {/* Arrow */}
                                        <span style={{ color: '#475569', fontSize: '18px', flexShrink: 0 }}>→</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* View all */}
                {eventos.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <Link
                            to="/eventos-cientificos"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: '#6366f1', color: 'white', padding: '12px 28px',
                                borderRadius: '100px', fontWeight: 600, fontSize: '14px',
                                textDecoration: 'none', transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                            onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
                        >
                            Ver todos los eventos <span>→</span>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default EventosSection;