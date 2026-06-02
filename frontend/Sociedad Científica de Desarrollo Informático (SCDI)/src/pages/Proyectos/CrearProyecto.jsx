import API_BASE_URL from '../../config/backendConfig';
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { useTranslation } from "react-i18next";

const CrearProyecto = () => {
    const { t } = useTranslation();
    const fondoCrearProyecto = {
        width: "100%",
        minHeight: "100%",
        backgroundImage: "url('/proyectos.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 0",
        boxSizing: "border-box",
    };
    
    const contenidoCrearProyecto = {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "40px",
        borderRadius: "12px",
        maxWidth: "500px",
        width: "100%",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        maxHeight: "90vh",
        overflowY: "auto",
    };

    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        nombre_proyecto: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        estado: "Pendiente",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", {
                state: { from: location.pathname }
            });
        }
    }, [navigate, location]);

    const handleChange = (e) => {
        setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE_URL}/proyectos-investigacion/crear-proyecto-investigacion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || t('crear_proyecto.error_crear'));
            }

            const data = await res.json();
            alert(t('crear_proyecto.exito_crear'));

            navigate(`/proyectos-investigacion/${data.proyecto.id_proyecto}`);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div style={fondoCrearProyecto}>
            <div style={contenidoCrearProyecto}>
                <div style={{ marginTop: 0, marginBottom: 0, paddingTop: '1rem', paddingBottom: '1rem' }}>
                    <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">{t("crear_proyecto.titulo_pagina")}</h2>

                    <form onSubmit={handleSubmit} noValidate>
                        <label htmlFor="nombre_proyecto" className="block mb-1 font-medium">{t("crear_proyecto.nombre")}</label>
                        <input
                            type="text"
                            id="nombre_proyecto"
                            name="nombre_proyecto"
                            placeholder={t("crear_proyecto.nombre_placeholder")}
                            value={formData.nombre_proyecto}
                            onChange={handleChange}
                            required
                            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <label htmlFor="descripcion" className="block mb-1 font-medium">{t("crear_proyecto.descripcion")}</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            placeholder={t("crear_proyecto.descripcion_placeholder")}
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                        />

                        <label htmlFor="fecha_inicio" className="block mb-1 font-medium">{t("crear_proyecto.fecha_inicio")}</label>
                        <input
                            type="date"
                            id="fecha_inicio"
                            name="fecha_inicio"
                            value={formData.fecha_inicio}
                            onChange={handleChange}
                            required
                            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <label htmlFor="fecha_fin" className="block mb-1 font-medium">{t("crear_proyecto.fecha_fin")}</label>
                        <input
                            type="date"
                            id="fecha_fin"
                            name="fecha_fin"
                            value={formData.fecha_fin}
                            onChange={handleChange}
                            required
                            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {error && <p className="mb-4 text-center text-red-600 font-semibold">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 text-white font-semibold rounded-md transition-colors
                                ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            {loading ? t("crear_proyecto.creando") : t("crear_proyecto.crear")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CrearProyecto;