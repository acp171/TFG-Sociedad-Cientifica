import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import PerfilUsuario from "../../components/Perfil/PerfilUsuario";
import Notificaciones from "../Notificaciones";
import InscripcionesUsuario from "../../components/Perfil/InscripcionesUsuario";
import GestionMiembros from "../../components/Perfil/GestionMiembros";
import { useTranslation } from "react-i18next";

const icons = {
    perfil: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a8.963 8.963 0 01-6.879-3.196z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    notificaciones: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    ),
    inscripciones: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    miembros: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

const PanelPerfil = () => {
    const { t } = useTranslation();
    const [selectedTab, setSelectedTab] = useState("perfil");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { userTipoSocio } = useAuth();

    // Leer datos básicos del token JWT
    const token = localStorage.getItem("token");
    let tokenPayload = null;
    try {
        if (token) tokenPayload = JSON.parse(atob(token.split(".")[1]));
    } catch (_) { /* silencioso */ }

    const tabsBase = [
        { id: "perfil", label: t("perfil_page.tab_perfil") },
        { id: "notificaciones", label: t("perfil_page.tab_notificaciones") },
        { id: "inscripciones", label: t("perfil_page.tab_inscripciones") },
    ];

    const tabs = userTipoSocio === 6
        ? [...tabsBase, { id: "miembros", label: t("perfil_page.tab_miembros") }]
        : tabsBase;

    const renderContent = () => {
        switch (selectedTab) {
            case "perfil": return <PerfilUsuario />;
            case "notificaciones": return <Notificaciones />;
            case "inscripciones": return <InscripcionesUsuario />;
            case "miembros": return <GestionMiembros />;
            default: return null;
        }
    };

    const nombre = tokenPayload?.nombre || "";
    const apellidos = tokenPayload?.apellidos || "";
    const email = tokenPayload?.email || "";
    const initials = `${(nombre[0] || "?").toUpperCase()}${(apellidos[0] || "?").toUpperCase()}`;

    const handleTabChange = (tabId) => {
        setSelectedTab(tabId);
        setSidebarOpen(false); // close on mobile after selecting
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)", position: "relative" }}>

            {/* Mobile overlay backdrop */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                        zIndex: 40, backdropFilter: "blur(2px)",
                    }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: "280px",
                minHeight: "100vh",
                background: "#1e293b",
                display: "flex",
                flexDirection: "column",
                padding: "0",
                boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
                flexShrink: 0,
                // Mobile: fixed overlay; Desktop: static in flow
                position: "fixed",
                top: 0,
                left: 0,
                height: "100%",
                zIndex: 50,
                transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.3s ease",
            }}
            // On desktop (≥768px), always show
            className="md:static md:translate-x-0 md:transform-none md:z-auto md:h-auto"
            >
                {/* Close button (mobile only) */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden absolute top-4 right-4 text-white opacity-60 hover:opacity-100 transition"
                    aria-label="Cerrar menú"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Logo area */}
                <div style={{
                    padding: "28px 24px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                }}>
                    <span style={{ color: "white", fontWeight: 800, fontSize: "20px", letterSpacing: "1px" }}>SCDI</span>
                    <p style={{ color: "#93c5fd", fontSize: "11px", margin: "2px 0 0", letterSpacing: "0.5px" }}>Panel de usuario</p>
                </div>

                {/* Avatar */}
                <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
                    <div style={{
                        width: "72px", height: "72px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 12px", fontSize: "26px", fontWeight: 700, color: "white",
                        boxShadow: "0 4px 15px rgba(59,130,246,0.4)",
                    }}>
                        {initials}
                    </div>
                    {nombre && (
                        <>
                            <p style={{ color: "white", fontWeight: 600, fontSize: "15px", margin: 0 }}>{nombre} {apellidos}</p>
                            <p style={{ color: "#94a3b8", fontSize: "12px", margin: "4px 0 0", wordBreak: "break-all" }}>{email}</p>
                        </>
                    )}
                </div>

                {/* Nav */}
                <nav style={{ padding: "16px 12px", flex: 1 }}>
                    {tabs.map((tab) => {
                        const active = selectedTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                style={{
                                    width: "100%", display: "flex", alignItems: "center", gap: "12px",
                                    padding: "12px 16px", borderRadius: "10px", border: "none", cursor: "pointer",
                                    marginBottom: "4px", textAlign: "left", fontSize: "14px", fontWeight: active ? 600 : 400,
                                    transition: "all 0.2s ease",
                                    background: active ? "rgba(59,130,246,0.15)" : "transparent",
                                    color: active ? "#60a5fa" : "#94a3b8",
                                    borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
                                }}
                            >
                                <span style={{ color: active ? "#60a5fa" : "#64748b" }}>{icons[tab.id]}</span>
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <p style={{ color: "#475569", fontSize: "11px", textAlign: "center" }}>© 2025 SCDI</p>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, overflowY: "auto", width: "100%" }} className="md:ml-0">
                {/* Mobile top bar */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Abrir menú"
                        style={{
                            background: "#1e293b", color: "white", border: "none",
                            borderRadius: "8px", padding: "8px", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span style={{ fontWeight: 700, fontSize: "16px", color: "#1e293b" }}>
                        {tabs.find(t => t.id === selectedTab)?.label || "Panel"}
                    </span>
                </div>

                <div style={{ padding: "24px 16px", maxWidth: "900px", margin: "0 auto" }} className="sm:px-6 lg:px-8">
                    {renderContent()}
                </div>
            </main>

            {/* Sidebar spacer for desktop so main content doesn't go under fixed sidebar */}
            <style>{`
                @media (min-width: 768px) {
                    aside { position: static !important; transform: none !important; height: auto !important; z-index: auto !important; }
                }
            `}</style>
        </div>
    );
};

export default PanelPerfil;