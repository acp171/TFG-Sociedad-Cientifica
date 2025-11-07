import { useEffect, useState } from "react";

const InscripcionesUsuario = () => {
    const [inscripciones, setInscripciones] = useState([]);
    const [loading, setLoading] = useState(true);

    const puedeCancelar = (fechaInicio) => {
        const hoy = new Date();
        const inicio = new Date(fechaInicio);

        const diffMs = inicio - hoy;
        const diffDias = diffMs / (1000 * 60 * 60 * 24);

        return diffDias > 10;
    };

    useEffect(() => {
        const fetchInscripciones = async () => {
            try {
                const res = await fetch(
                    "https://tfg-sociedad-cientifica-production.up.railway.app/incripciones/listado-incripciones-usuario",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                const data = await res.json();
                setInscripciones(data.inscripciones || []);
            } catch (error) {
                console.error("Error al obtener inscripciones:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInscripciones();
    }, []);

    const cancelarInscripcion = async (id_evento) => {
        if (!confirm("¿Seguro que deseas cancelar esta inscripción?")) return;

        try {
            const res = await fetch(
                `https://tfg-sociedad-cientifica-production.up.railway.app/eventos-cientificos/${id_evento}/cancelar-inscripcion`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const data = await res.json();

            if (res.ok) {
                alert("Inscripción cancelada correctamente.");
                setInscripciones((prev) =>
                    prev.filter((ins) => ins.id_evento !== id_evento)
                );
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error al cancelar:", error);
            alert("Error al cancelar la inscripción.");
        }
    };

    if (loading)
        return (
            <p className="text-center p-6">Cargando inscripciones...</p>
        );

    return (
        <div className="min-h-[80vh] bg-gradient-to-b from-blue-200 to-white py-16 px-4">
            <div className="max-w-4xl mx-auto">

                <h1 className="text-4xl font-bold text-indigo-700 mb-10 text-center">
                    Mis inscripciones
                </h1>

                {inscripciones.length === 0 ? (
                    <div className="bg-white shadow-lg p-10 rounded-2xl text-center">
                        <p className="text-gray-600 text-lg">
                            No estás inscrito en ningún evento.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {inscripciones.map((ins) => {
                            const puede = puedeCancelar(ins.fecha_evento_inicio);

                            return (
                                <div
                                    key={ins.id_evento}
                                    className="bg-white p-6 rounded-xl shadow-xl border border-gray-200"
                                >
                                    <h2 className="text-2xl font-bold text-indigo-800">
                                        {ins.nombre_evento}
                                    </h2>

                                    <p className="text-gray-700 mt-2">
                                        <strong>Inicio:</strong>{" "}
                                        {new Date(
                                            ins.fecha_evento_inicio
                                        ).toLocaleString()}
                                    </p>

                                    <p className="text-gray-700">
                                        <strong>Fin:</strong>{" "}
                                        {new Date(
                                            ins.fecha_evento_fin
                                        ).toLocaleString()}
                                    </p>

                                    <p className="mt-3 text-gray-500">
                                        {ins.descripcion_evento.substring(0, 120)}...
                                    </p>

                                    {puede ? (
                                        <button
                                            onClick={() => cancelarInscripcion(ins.id_evento)}
                                            className="mt-5 w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            Cancelar inscripción
                                        </button>
                                    ) : (
                                        <p className="mt-5 text-center text-gray-600 text-sm">
                                            ❌ No puedes cancelar (faltan menos de 10 días)
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InscripcionesUsuario;