import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const InscripcionesUsuario = () => {
    const { t } = useTranslation();
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
                    `${API_BASE_URL}/incripciones/listado-incripciones-usuario`,
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
        if (!confirm(t("perfil_page.confirmar_cancelar_inscripcion"))) return;

        try {
            const res = await fetch(
                `${API_BASE_URL}/eventos-cientificos/${id_evento}/cancelar-inscripcion`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const data = await res.json();

            if (res.ok) {
                alert(t("perfil_page.inscripcion_cancelada"));
                setInscripciones((prev) =>
                    prev.filter((ins) => ins.id_evento !== id_evento)
                );
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error al cancelar:", error);
            alert(t("perfil_page.error_cancelar_inscripcion"));
        }
    };

    if (loading)
        return (
            <p className="text-center p-6">{t("perfil_page.cargando_inscripciones")}</p>
        );

    return (
        <div className="min-h-[80vh] bg-gradient-to-b from-blue-200 to-white py-16 px-4">
            <div className="max-w-4xl mx-auto">

                <h1 className="text-4xl font-bold text-indigo-700 mb-10 text-center">
                    {t("perfil_page.mis_inscripciones")}
                </h1>

                {inscripciones.length === 0 ? (
                    <div className="bg-white shadow-lg p-10 rounded-2xl text-center">
                        <p className="text-gray-600 text-lg">
                            {t("perfil_page.no_inscrito")}
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
                                        <strong>{t("perfil_page.inicio")}:</strong>{" "}
                                        {new Date(
                                            ins.fecha_evento_inicio
                                        ).toLocaleString()}
                                    </p>

                                    <p className="text-gray-700">
                                        <strong>{t("perfil_page.fin")}:</strong>{" "}
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
                                            {t("perfil_page.cancelar_inscripcion")}
                                        </button>
                                    ) : (
                                        <p className="mt-5 text-center text-gray-600 text-sm">
                                            {t("perfil_page.no_puede_cancelar")}
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