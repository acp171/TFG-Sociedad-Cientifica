import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const InfoCard = ({ label, value, icon }) => (
    <div style={{
        background: "#f8fafc", borderRadius: "12px", padding: "18px 20px",
        border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px",
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {icon}
            {label}
        </div>
        <p style={{ margin: 0, color: "#1e293b", fontSize: "15px", fontWeight: 500 }}>{value || "—"}</p>
    </div>
);

const PerfilUsuario = () => {
    const { t } = useTranslation();
    const [usuario, setUsuario] = useState(null);
    const [editando, setEditando] = useState(false);
    const [saving, setSaving] = useState(false);

    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [telefono, setTelefono] = useState("");

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/perfil`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                if (!res.ok) throw new Error("No se pudo cargar el perfil");
                const data = await res.json();
                setUsuario(data.socio);
                setNombre(data.socio.nombre);
                setApellidos(data.socio.apellidos);
                setTelefono(data.socio.telefono);
            } catch (error) {
                console.error(error);
            }
        };
        fetchPerfil();
    }, []);

    const handleGuardar = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = await fetch(`${API_BASE_URL}/perfil`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ nombre, apellidos, telefono }),
        });
        const data = await res.json();
        setSaving(false);
        if (res.ok) {
            alert(t("perfil_page.perfil_actualizado"));
            setUsuario(data.socio);
            setEditando(false);
        } else {
            alert(t("perfil_page.error_actualizar_perfil"));
        }
    };

    const handleBaja = async () => {
        if (!confirm(t("perfil_page.confirmar_baja"))) return;
        const res = await fetch(`${API_BASE_URL}/perfil`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
            alert(t("perfil_page.cuenta_eliminada"));
            localStorage.removeItem("token");
            window.location.href = "/";
        } else {
            alert(t("perfil_page.error_eliminar"));
        }
    };

    if (!usuario) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "#94a3b8" }}>
            {t("perfil_page.cargando")}
        </div>
    );

    const initials = `${(usuario.nombre || "?")[0]}${(usuario.apellidos || "?")[0]}`.toUpperCase();

    return (
        <div>
            {/* Header card */}
            <div style={{
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                borderRadius: "20px",
                padding: "36px 40px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "28px",
                boxShadow: "0 8px 32px rgba(15,23,42,0.2)",
            }}>
                <div style={{
                    width: "88px", height: "88px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "32px", fontWeight: 700, color: "white", flexShrink: 0,
                    boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
                }}>
                    {initials}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: "0 0 4px", color: "white", fontSize: "24px", fontWeight: 700 }}>
                        {usuario.nombre} {usuario.apellidos}
                    </h1>
                    <p style={{ margin: "0 0 12px", color: "#94a3b8", fontSize: "14px" }}>{usuario.email}</p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{
                            background: "rgba(59,130,246,0.2)", color: "#60a5fa",
                            padding: "4px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 600,
                            border: "1px solid rgba(59,130,246,0.3)"
                        }}>
                            {usuario.tipo_socio}
                        </span>
                        <span style={{
                            background: "rgba(168,85,247,0.2)", color: "#c084fc",
                            padding: "4px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 600,
                            border: "1px solid rgba(168,85,247,0.3)"
                        }}>
                            {usuario.socio_rol}
                        </span>
                    </div>
                </div>
                {!editando && (
                    <button
                        onClick={() => setEditando(true)}
                        style={{
                            padding: "10px 20px", background: "rgba(59,130,246,0.15)",
                            color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)",
                            borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                            display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t("perfil_page.editar_perfil")}
                    </button>
                )}
            </div>

            {/* Info grid */}
            {!editando && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                    <InfoCard
                        label={t("perfil_page.nombre_completo")}
                        value={`${usuario.nombre} ${usuario.apellidos}`}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" style={{ width: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                    />
                    <InfoCard
                        label={t("perfil_page.email")}
                        value={usuario.email}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" style={{ width: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                    />
                    <InfoCard
                        label={t("perfil_page.telefono")}
                        value={usuario.telefono}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" style={{ width: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                    />
                    <InfoCard
                        label={t("perfil_page.fecha_nacimiento")}
                        value={new Date(usuario.fecha_nacimiento).toLocaleDateString()}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" style={{ width: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    />
                </div>
            )}

            {/* Edit form */}
            {editando && (
                <div style={{
                    background: "white", borderRadius: "16px", padding: "32px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", marginBottom: "24px"
                }}>
                    <h2 style={{ margin: "0 0 24px", fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
                        {t("perfil_page.editar_perfil")}
                    </h2>
                    <form onSubmit={handleGuardar} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {[
                            { label: t("perfil_page.nombre"), value: nombre, setter: setNombre },
                            { label: t("perfil_page.apellidos"), value: apellidos, setter: setApellidos },
                            { label: t("perfil_page.telefono"), value: telefono, setter: setTelefono, full: true },
                        ].map(({ label, value, setter, full }) => (
                            <div key={label} style={{ gridColumn: full ? "span 2" : "span 1" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    {label}
                                </label>
                                <input
                                    value={value}
                                    onChange={(e) => setter(e.target.value)}
                                    style={{
                                        width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
                                        borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box",
                                    }}
                                    onFocus={e => e.target.style.borderColor = "#3b82f6"}
                                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                                />
                            </div>
                        ))}
                        <div style={{ gridColumn: "span 2", display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                            <button
                                type="button"
                                onClick={() => setEditando(false)}
                                style={{ padding: "10px 24px", border: "1.5px solid #e2e8f0", background: "white", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "#64748b" }}
                            >
                                {t("perfil_page.cancelar_edicion")}
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    padding: "10px 24px", background: saving ? "#94a3b8" : "#2563eb",
                                    color: "white", border: "none", borderRadius: "10px", cursor: saving ? "not-allowed" : "pointer",
                                    fontSize: "14px", fontWeight: 600,
                                }}
                            >
                                {saving ? "Guardando..." : t("perfil_page.guardar_cambios")}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Danger zone */}
            <div style={{
                background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "16px",
                padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#991b1b", fontSize: "15px" }}>Zona de peligro</p>
                    <p style={{ margin: "4px 0 0", color: "#b91c1c", fontSize: "13px" }}>
                        {t("perfil_page.confirmar_baja")}
                    </p>
                </div>
                <button
                    onClick={handleBaja}
                    style={{
                        padding: "10px 20px", background: "#dc2626", color: "white",
                        border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t("perfil_page.dar_baja")}
                </button>
            </div>
        </div>
    );
};

export default PerfilUsuario;