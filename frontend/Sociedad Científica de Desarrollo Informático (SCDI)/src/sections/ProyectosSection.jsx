import { useEffect, useState } from 'react';

const ProyectosSection = () => {
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const images = [
        { src: "Desarrollo Web", icono: "🌐" },
        { src: "IA & Machine Learning", icono: "🧠" },
        { src: "Ciberseguridad", icono: "🔒" },
        { src: "Eventos y Hackatones", icono: "⚡" },
    ];

    useEffect(() => {
        fetch('https://tfg-sociedad-cientifica-production.up.railway.app/listado-proyectos-investigacion')
        .then(res => res.json())
        .then(data => {
            setProyectos(data.proyectos.listaProyectos || []);
            setLoading(false);
        })
        .catch(() => { setLoading(false); console.log("F")});
    }, []);

    return (
        <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Proyectos Destacados</h2>

        {loading ? (
            <p className="text-center">Cargando proyectos...</p>
        ) : proyectos.length === 0 ? (
            <p className="text-center">No hay proyectos disponibles.</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-40">
                {proyectos.slice(0, 4).map(proyecto => (
                    <div
                    key={proyecto.id_proyecto}
                    className="bg-white rounded-2xl shadow border p-6 flex flex-col justify-center items-center text-center"
                    style={{ aspectRatio: '1 / 1', minHeight: '250px' }}
                    >
                        <h3 className="text-xl font-semibold mb-2">{proyecto.nombre_proyecto}</h3>
                        <p className="text-gray-700">{proyecto.descripcion}</p>
                    </div>
                ))}
            </div>
        )}
        </section>
    );
};

export default ProyectosSection;
