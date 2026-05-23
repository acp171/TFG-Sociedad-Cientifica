import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { HiArrowLeft, HiTrash } from "react-icons/hi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import PasarelaPago from "../../components/Pago/PasarelaPago";

const EventoDetalles = () => {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [miembrosComite, setMiembrosComite] = useState([]);
    const [miembrosInscritos, setMiembrosInscritos] = useState([]);
    const [coords, setCoords] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem("socio"));

    // Estado pasarela de pago
    const [clientSecret, setClientSecret] = useState(null);
    const [mostrarPago, setMostrarPago] = useState(false);
    const [precioPago, setPrecioPago] = useState(0);

    useEffect(() => {
        fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/eventos-cientificos/${id}`)
            .then(res => res.json())
            .then(data => {
                setEvento(data.evento);
                setMiembrosComite(data.miembrosComite || []);
                if (data.evento?.direccion?.latitud && data.evento?.direccion?.longitud) {
                    setCoords({
                        lat: parseFloat(data.evento.direccion.latitud),
                        lon: parseFloat(data.evento.direccion.longitud)
                    });
                }
                setMiembrosInscritos(data.miembrosIncritos);
            });
    }, [id]);

    const eliminar = async () => {
        if (!window.confirm("¿Seguro que deseas eliminar este evento?")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/eventos-cientificos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            navigate("/eventos-cientificos");
        }
    };

    const guardarCambios = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/eventos-cientificos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre_evento: evento.nombre_evento,
                    descripcion_evento: evento.descripcion_evento,
                    fecha_evento_inicio: evento.fecha_evento_inicio,
                    fecha_evento_fin: evento.fecha_evento_fin
                })
            });

            if (!res.ok) {
                const error = await res.json();
                alert("Error al guardar: " + error.message);
                return;
            }

            alert("Cambios guardados con éxito");
            setModoEdicion(false);
        } catch (error) {
            console.error("Error al actualizar evento:", error);
            alert("No se pudo actualizar el evento.");
        }
    };

    const inscribirse = async () => {
        const token = localStorage.getItem("token");
    
        if (token) {
            const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/eventos-cientificos/${id}/inscribirse`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        
            const data = await res.json();
            if (res.ok && data.clientSecret) {
                setClientSecret(data.clientSecret);
                setPrecioPago(evento?.precio ?? 0);
                setMostrarPago(true);
            } else {
                alert(data.message || "No se pudo iniciar el pago");
            }
        }
        else {
            navigate("/login", {
                state: { from: location.pathname }
            });
        }
    };

    const handlePagoExito = () => {
        navigate(`/eventos-cientificos/${id}/inscribirse/evento-exito`);
    };

    const cancelarInscripcion = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/eventos-cientificos/${id}/cancelar-inscripcion`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    
        const data = await res.json();
        if (res.ok) {
            alert("Inscripción cancelada con éxito");
            setMiembrosInscritos(prev =>
                prev.filter(m => m.socio !== usuario?.id)
            );
        } else {
            alert("Error al cancelar inscripción");
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

    const presidentes = miembrosComite.filter((m) => m.rol === "Presidente");
    const esPresidente = presidentes.some((p) => p.id_socio === usuario?.id);
    const esAdministrador = usuario?.rol === 1;
    const estaInscrito = miembrosInscritos.some((m) => m.socio === usuario?.id);
    
    const fechaEvento = new Date(evento.fecha_evento_inicio);
    const hoy = new Date();
    const unaSemanaEnMs = 7 * 24 * 60 * 60 * 1000;
    const diferenciaEnMs = fechaEvento - hoy;
    const habilitado = diferenciaEnMs > unaSemanaEnMs;

    return (
        <section className="min-h-screen bg-gradient-to-b from-blue-200 to-white py-16 px-6 lg:px-20 flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-8">
                <button
                    onClick={() => navigate("/eventos-cientificos")}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 rounded"
                >
                    <HiArrowLeft className="mr-2 text-xl" /> Volver
                </button>

                {(esPresidente || esAdministrador) && (
                    <div className="flex gap-4">
                        {modoEdicion ? (
                            <button
                                onClick={guardarCambios}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow-md transition focus:outline-none focus:ring-2 focus:ring-green-600"
                            >
                                Guardar cambios
                            </button>
                        ) : (
                            <button
                                onClick={() => setModoEdicion(true)}
                                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-md transition shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                Editar evento
                            </button>
                        )}

                        <button
                            onClick={eliminar}
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition shadow-md focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                            <HiTrash className="text-xl" /> Eliminar evento
                        </button>
                    </div>
                )}
            </div>

            <article className="bg-gradient-to-b from-blue-50 to-white shadow-xl rounded-xl p-10 max-w-4xl w-full">
                {modoEdicion ? (
                    <input
                        type="text"
                        value={evento.nombre_evento}
                        onChange={(e) =>
                            setEvento({ ...evento, nombre_evento: e.target.value })
                        }
                        className="text-3xl font-bold mb-6 border border-gray-300 px-4 py-2 rounded w-full"
                    />
                ) : (
                    <h1 className="text-center text-5xl font-extrabold mb-8 text-gray-900 tracking-wide drop-shadow-sm">
                        {evento.nombre_evento}
                    </h1>
                )}

                {modoEdicion ? (
                    <textarea
                        value={evento.descripcion_evento}
                        onChange={(e) =>
                            setEvento({ ...evento, descripcion_evento: e.target.value })
                        }
                        rows={6}
                        className="w-full border border-gray-300 rounded p-4 mb-8"
                    />
                ) : (
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg mb-12 border-l-4 border-blue-600 pl-6">
                        {evento.descripcion_evento}
                    </p>
                )}

                {modoEdicion ? (
                    <div className="flex gap-4 mb-10 flex-wrap">
                        <input
                            type="datetime-local"
                            value={evento.fecha_evento_inicio}
                            onChange={(e) =>
                                setEvento({ ...evento, fecha_evento_inicio: e.target.value })
                            }
                            className="border border-gray-300 rounded p-2"
                        />
                        <input
                            type="datetime-local"
                            value={evento.fecha_evento_fin}
                            onChange={(e) =>
                                setEvento({ ...evento, fecha_evento_fin: e.target.value })
                            }
                            className="border border-gray-300 rounded p-2"
                        />
                    </div>
                ) : (
                    <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
                        <p className="text-sm text-black italic">
                            Empieza {fechaInicioFormateada} hasta {fechaFinFormateada}.
                        </p>
                    </div>
                )}

                {evento.direccion && (
                    <div className="mb-10 text-gray-800">
                        <h2 className="text-2xl font-semibold mb-2">Dirección del evento</h2>
                        <p>{evento.direccion.calle}, {evento.direccion.ciudad}, {evento.direccion.provincia}, {evento.direccion.codigo_postal}</p>
                    </div>
                )}

                {coords && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ubicación en el mapa</h2>
                        <MapContainer
                            center={[coords.lat, coords.lon]}
                            zoom={16}
                            scrollWheelZoom={false}
                            style={{ height: '300px', width: '100%', borderRadius: '0.5rem' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[coords.lat, coords.lon]}>
                                <Popup>
                                    {evento.nombre_evento}<br />
                                    {evento.direccion.calle}, {evento.direccion.ciudad}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                )}

                {miembrosComite.length > 0 && (
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

                {habilitado ? (
                    estaInscrito ? (
                        <button
                            onClick={cancelarInscripcion}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
                        >
                            Cancelar inscripción
                        </button>
                    ) : (
                        <button 
                            onClick={inscribirse} 
                            className="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer"
                        >
                            Inscribirme
                        </button>
                    )
                ) : (
                    <p className="mt-4 text-red-600 font-medium">
                        Plazo de inscripción expirado
                    </p>
                )}
            </article>

            {/* Pasarela de pago embebida */}
            {mostrarPago && clientSecret && (
                <PasarelaPago
                    clientSecret={clientSecret}
                    importe={precioPago}
                    descripcion={`Inscripción: ${evento?.nombre_evento}`}
                    onSuccess={handlePagoExito}
                    onCancel={() => setMostrarPago(false)}
                />
            )}
        </section>
    );
};

export default EventoDetalles;