import { useEffect, useState } from 'react';

const EventosSection = () => {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('https://tfg-sociedad-cientifica-production.up.railway.app/listado-eventos-cientificos')
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
        <h2 className="text-3xl font-bold mb-8">Próximos Eventos</h2>

        {loading ? (
            <p className="text-gray-500">Cargando eventos...</p>
        ) : eventos.length === 0 ? (
            <p className="text-gray-500">No hay eventos próximos.</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                {eventos.slice(0, 4).map(evento => (
                    <div key={evento.id_evento} className="border p-4 rounded-lg">
                        <span className="block font-bold text-lg">{evento.nombre_evento}</span>
                        <span className="text-gray-600">{evento.fecha_evento_inicio} - {evento.fecha_evento_fin}</span>
                    </div>
                ))}
            </div>          
        )}
        </section>
    );
};

export default EventosSection;