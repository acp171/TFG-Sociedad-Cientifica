import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiArrowLeft } from 'react-icons/hi';

import DatosProyecto from "../../components/Proyectos/DatosProyecto";
import MiembrosProyecto from "../../components/Proyectos/MiembrosProyecto";
import { useTranslation } from "react-i18next";
import API_BASE_URL from "../../backendConfig";

const ProyectoDetalles = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [proyecto, setProyecto] = useState(null);
    const [miembros, setMiembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("datos");
    const usuario = JSON.parse(localStorage.getItem("socio"));

    const fetchProyecto = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/proyectos-investigacion/${slug}`);

            if (!res.ok) {
                throw new Error("Proyecto no encontrado")
            };
            
            const data = await res.json();
            setProyecto(data.proyecto);
            setMiembros(data.miembros);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProyecto();
    }, [slug]);

    if (loading) {
        return <p className="text-center mt-10">{t("common.cargando")}</p>;
    }
    if (error) {
        return <p>Error: {error}</p>;
    }

    const presidentes = miembros.filter((miembro) => miembro.rol === "Presidente");
    const esPresidente = presidentes.some((presidente) => presidente.id_socio === usuario?.id);

    return (
        <section className="min-h-screen w-full bg-gradient-to-b from-blue-200 to-white py-16 px-6 lg:px-20 font-sans">
            <button
                onClick={() => navigate("/proyectos-investigacion")}
                className="self-start mb-6 flex items-center text-blue-600 hover:text-blue-800 font-semibold transition"
            >
                <HiArrowLeft className="mr-2 text-xl" />
                {t("detalle_comun.volver")}
            </button>

            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">{proyecto.nombre_proyecto}</h1>

            <nav className="flex flex-wrap gap-3 md:gap-4 mb-8 md:mb-12">
                <button
                    className={`flex-1 md:flex-none px-4 py-2 rounded-md font-semibold text-sm md:text-base ${
                    activeTab === "datos" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setActiveTab("datos")}
                >
                    {t("detalle_proyecto.datos")}
                </button>
                <button
                    className={`flex-1 md:flex-none px-4 py-2 rounded-md font-semibold text-sm md:text-base ${
                    activeTab === "miembros" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setActiveTab("miembros")}
                >
                    {t("detalle_proyecto.miembros")}
                </button>
            </nav>

            <div>
                {activeTab === "datos" && (
                    <DatosProyecto
                        proyecto={proyecto}
                        setProyecto={setProyecto}
                        navigate={navigate}
                        proyectoId={slug}
                        esPresidente={esPresidente}
                        token={localStorage.getItem("token")}
                    />
                )}
                {activeTab === "miembros" && (
                    <MiembrosProyecto
                        miembros={miembros}
                        setMiembros={setMiembros}
                        proyectoId={slug}
                        esPresidente={esPresidente}
                        token={localStorage.getItem("token")}
                        refetchProyecto={fetchProyecto}
                    />
                )}
            </div>
        </section>
    );
};

export default ProyectoDetalles;