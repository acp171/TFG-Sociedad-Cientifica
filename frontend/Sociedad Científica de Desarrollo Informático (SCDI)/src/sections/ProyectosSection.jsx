import API_BASE_URL from '../config/backendConfig';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const statusConfig = {
    activo: { label: 'Activo', bg: 'rgba(34,197,94,0.15)', color: '#16a34a', dot: '#22c55e' },
    finalizado: { label: 'Finalizado', bg: 'rgba(148,163,184,0.15)', color: '#64748b', dot: '#94a3b8' },
    pausado: { label: 'Pausado', bg: 'rgba(251,191,36,0.15)', color: '#b45309', dot: '#f59e0b' },
    cancelado: { label: 'Cancelado', bg: 'rgba(239,68,68,0.15)', color: '#dc2626', dot: '#ef4444' },
};

const cardGradients = [
    'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
    'linear-gradient(135deg, #065f46 0%, #0f766e 100%)',
    'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)',
    'linear-gradient(135deg, #581c87 0%, #6d28d9 100%)',
];

const ProyectosSection = () => {
    const { t } = useTranslation();
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/listado-proyectos-investigacion`)
            .then(res => res.json())
            .then(data => {
                setProyectos(data.proyectos?.listaProyectos || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <section style={{ padding: '80px 0', background: 'linear-gradient(180deg, #f8faff 0%, #eef2ff 100%)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                    <span style={{
                        display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                        padding: '6px 18px', borderRadius: '100px', fontSize: '13px', fontWeight: 700,
                        letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px',
                    }}>
                        Investigación
                    </span>
                    <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.2 }}>
                        {t('home.proyectos_destacados')}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '520px', margin: '0 auto' }}>
                        Descubre los proyectos de investigación más recientes de nuestra sociedad científica.
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} style={{
                                flex: 1, minWidth: '220px', maxWidth: '280px', height: '260px',
                                background: '#e2e8f0', borderRadius: '20px', animation: 'pulse 1.5s infinite'
                            }} />
                        ))}
                    </div>
                ) : proyectos.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '16px' }}>{t('home.no_proyectos')}</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                        {proyectos.slice(0, 4).map((proyecto, i) => {
                            const status = statusConfig[proyecto.estado?.toLowerCase()] || statusConfig.activo;
                            const gradient = cardGradients[i % cardGradients.length];
                            return (
                                <Link
                                    key={proyecto.id_proyecto}
                                    to={`/proyectos-investigacion/${proyecto.slug || proyecto.id_proyecto}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div style={{
                                        background: gradient,
                                        borderRadius: '20px',
                                        padding: '32px 28px',
                                        minHeight: '280px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-6px)';
                                            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.2)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
                                        }}
                                    >
                                        {/* Decorative circle */}
                                        <div style={{
                                            position: 'absolute', top: '-30px', right: '-30px',
                                            width: '120px', height: '120px', borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.08)',
                                        }} />
                                        <div style={{
                                            position: 'absolute', bottom: '-20px', left: '-20px',
                                            width: '80px', height: '80px', borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.05)',
                                        }} />

                                        {/* Status badge */}
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            background: status.bg, backdropFilter: 'blur(4px)',
                                            padding: '4px 12px', borderRadius: '100px', width: 'fit-content',
                                        }}>
                                            <span style={{
                                                width: '6px', height: '6px', borderRadius: '50%',
                                                background: status.dot, display: 'block',
                                            }} />
                                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 700 }}>
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div>
                                            <h3 style={{
                                                color: 'white', fontSize: '18px', fontWeight: 700,
                                                margin: '20px 0 10px', lineHeight: 1.3,
                                            }}>
                                                {proyecto.nombre_proyecto}
                                            </h3>
                                            <p style={{
                                                color: 'rgba(255,255,255,0.72)', fontSize: '13px',
                                                lineHeight: 1.6, margin: 0,
                                                display: '-webkit-box', WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                            }}>
                                                {proyecto.descripcion}
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
                                                {proyecto.fecha_fin ? `Fin: ${new Date(proyecto.fecha_fin).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}` : ''}
                                            </span>
                                            <span style={{
                                                color: 'white', fontSize: '20px', fontWeight: 300,
                                                lineHeight: 1,
                                            }}>→</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* View all link */}
                {proyectos.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <Link
                            to="/proyectos-investigacion"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: '#1e293b', color: 'white', padding: '12px 28px',
                                borderRadius: '100px', fontWeight: 600, fontSize: '14px',
                                textDecoration: 'none', transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
                            onMouseLeave={e => e.currentTarget.style.background = '#1e293b'}
                        >
                            Ver todos los proyectos <span>→</span>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProyectosSection;
