import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import DatosProyecto from "../../components/Proyectos/DatosProyecto";
import MiembrosProyecto from "../../components/Proyectos/MiembrosProyecto";

const ProyectoDetalle = ({ userRole, userId }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [proyecto, setProyecto] = useState(null);
    const [miembros, setMiembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("datos");

    useEffect(() => {
        const fetchProyecto = async () => {
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:4000/proyectos-investigacion/${id}`);
                if (!res.ok) {
                    throw new Error("Proyecto no encontrado");
                }
                const data = await res.json();
                setProyecto(data.proyecto);
                setMiembros(data.miembros);
                setLoading(false);
            } 
            catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchProyecto();
    }, [id]);

    if (loading) {
        return <p>Cargando...</p>;
    }
    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <section className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white py-16 px-6 lg:px-20 font-sans">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8">{proyecto.nombre_proyecto}</h1>

            <nav className="flex gap-4 mb-12">
                <button
                    className={`px-4 py-2 rounded-md font-semibold ${
                    activeTab === "datos" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setActiveTab("datos")}
                >
                    Datos del Proyecto
                </button>
                <button
                    className={`px-4 py-2 rounded-md font-semibold ${
                    activeTab === "miembros" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setActiveTab("miembros")}
                >
                    Miembros del Proyecto
                </button>
            </nav>

            <div>
                {activeTab === "datos" && (
                    <DatosProyecto
                    proyecto={proyecto}
                    setProyecto={setProyecto}
                    userRole={userRole}
                    navigate={navigate}
                    proyectoId={id}
                    />
                )}
                {activeTab === "miembros" && (
                    <MiembrosProyecto
                    miembros={miembros}
                    setMiembros={setMiembros}
                    userRole={userRole}
                    proyectoId={id}
                    />
                )}
            </div>
        </section>
    );
};

export default ProyectoDetalle;