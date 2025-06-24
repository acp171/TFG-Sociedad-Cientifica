import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { HiArrowLeft, HiDownload, HiTrash } from "react-icons/hi";

const EventoDetalles = () => {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [miembrosComite, setMiembrosComite] = useState(null);
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem("socio"));

    useEffect(() => {
        fetch(`http://localhost:4000/eventos-cientificos/${id}`)
            .then(res => res.json())
            .then(data => {
                setEvento(data.evento);
                setMiembrosComite(data.miembrosComite)
            });
    }, [id]);

    const eliminar = async () => {
        if (!window.confirm("¿Seguro que deseas eliminar este evento? Esta acción no se puede deshacer.")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:4000/eventos-cientificos/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            navigate("/eventos-cientificos");
        }
    };

    if (!evento) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
                <p className="text-gray-500 text-lg">Cargando evento...</p>
            </div>
        );
    }

    const fechaInicioFormateada = new Date(evento.fecha_evento_inicio).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    const fechaFinFormateada = new Date(evento.fecha_evento_fin).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const presidentes = miembrosComite.filter((miembro) => miembro.rol === "Presidente");
    const esPresidente = presidentes.some((presidente) => presidente.id_socio === usuario?.id);

    return (
        <section className="min-h-screen bg-gradient-to-b from-blue-200 to-white py-16 px-6 lg:px-20 flex flex-col items-center">
            <button
                onClick={() => navigate(-1)}
                className="self-start mb-8 flex items-center text-blue-600 hover:text-blue-800 font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 rounded"
                aria-label="Volver a la página anterior"
            >
                <HiArrowLeft className="mr-2 text-xl" /> Volver
            </button>

            <article className="bg-gradient-to-b from-blue-50 to-white shadow-xl rounded-xl p-10 max-w-4xl w-full">
                <h1 className="text-center text-5xl font-extrabold mb-8 text-gray-900 tracking-wide drop-shadow-sm">
                    {evento.nombre_evento}
                </h1>

                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg mb-12 border-l-4 border-blue-600 pl-6">
                    {evento.descripcion_evento}
                </p>

                <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
                    <p className="text-sm text-black italic">
                        Empieza {fechaInicioFormateada} hasta {fechaFinFormateada}.
                    </p>
                </div>

                {miembrosComite && miembrosComite.length > 0 && (
                    <section aria-label="Miembros del comité" className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Miembros del comité</h2>
                        <ul className="grid gap-4">
                            {miembrosComite.map((miembro) => (
                                <li
                                    key={miembro.id_socio}
                                    className="bg-white rounded-md p-4 shadow-sm border border-gray-200"
                                >
                                    <p className="text-lg font-medium text-gray-900">
                                        {miembro.nombre} {miembro.apellidos}
                                    </p>
                                    <p className="text-sm text-gray-600">{miembro.rol}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {esPresidente && (
                    <div className="flex justify-end">
                        <button
                            onClick={eliminar}
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition shadow-md focus:outline-none focus:ring-2 focus:ring-red-600"
                            aria-label="Eliminar evento"
                        >
                            <HiTrash className="text-xl" /> Eliminar evento
                        </button>
                    </div>
                )}
            </article>
        </section>
    );
};

export default EventoDetalles;