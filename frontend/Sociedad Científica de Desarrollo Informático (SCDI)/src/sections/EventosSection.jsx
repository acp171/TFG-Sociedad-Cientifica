import API_BASE_URL from '../config/backendConfig';
import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";

const EventosSection = () => {
    const { t } = useTranslation();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/listado-eventos-cientificos`)
            .then((res) => res.json())
            .then((data) => {
                setEventos(data.eventos.listaEventos || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error al obtener eventos:', err);
                setLoading(false);
            });
    }, []);

    return (
        <section className="py-16 px-6 max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">{t("home.proximos_eventos")}</h2>

            {loading ? (
                <p className="text-gray-500">{t("home.cargando_eventos")}</p>
            ) : eventos.length === 0 ? (
                <p className="text-gray-500">{t("home.no_eventos")}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                    {eventos.slice(0, 4).map(evento => (
                        <div key={evento.id_evento} className="border p-4 rounded-lg">
                            <span className="block font-bold text-lg">{evento.nombre_evento}</span>
                            <span className="text-gray-600 block text-sm mt-2">
                                {new Date(evento.fecha_evento_inicio).toLocaleString()} <br />
                                {t("home.hasta")} <br />
                                {new Date(evento.fecha_evento_fin).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default EventosSection;