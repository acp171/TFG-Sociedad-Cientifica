import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const AdminEventos = () => {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvento, setEditingEvento] = useState(null);

    const [formData, setFormData] = useState({
        nombre_evento: "",
        descripcion_evento: "",
        fecha_evento_inicio: "",
        fecha_evento_fin: "",
        provincia: "",
        calleInput: "",
        direccionExtra: "",
    });

    const [calles, setCalles] = useState([]);
    const [calleSeleccionada, setCalleSeleccionada] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchEventos();
    }, []);

    const fetchEventos = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE_URL}/listado-eventos-cientificos`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) throw new Error("Error al cargar eventos");
            const data = await res.json();
            setEventos(data.eventos?.listaEventos || []);
        }
        catch {
            setError("Error cargando eventos");
        }
        finally {
            setLoading(false);
        }
    };

    const buscarCalles = async (valor) => {
        if (!formData.provincia || !valor) {
            setCalles([]);
            return;
        }
        try {
            const url = `${API_BASE_URL}/buscar-calles?provincia=${encodeURIComponent(
                formData.provincia
            )}&query=${encodeURIComponent(valor)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Error al buscar calles");
            const data = await res.json();
            const callesFiltradas = data.filter(
                (item) =>
                    item.type === "residential" ||
                    item.type === "street" ||
                    item.class === "highway"
            );
            setCalles(callesFiltradas);
        }
        catch (error) {
            console.error("Error buscando calles:", error);
            setCalles([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "calleInput") {
            buscarCalles(value);
            setCalleSeleccionada(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.nombre_evento.trim()) {
            setError("El nombre del evento es obligatorio");
            return;
        }
        if (!formData.fecha_evento_inicio || !formData.fecha_evento_fin) {
            setError("Las fechas de inicio y fin son obligatorias");
            return;
        }
        if (!editingEvento && !formData.provincia) {
            setError("La provincia es obligatoria");
            return;
        }
        if (!editingEvento && !calleSeleccionada) {
            setError("Debes seleccionar una calle válida");
            return;
        }

        const direccion = {
            calle: calleSeleccionada.display_name,
            ciudad:
                calleSeleccionada.address.city ||
                calleSeleccionada.address.town ||
                calleSeleccionada.address.village ||
                formData.provincia,
            provincia: formData.provincia,
            codigo_postal: calleSeleccionada.address.postcode || "",
            extra: formData.direccionExtra,
            latitud: parseFloat(calleSeleccionada.lat),
            longitud: parseFloat(calleSeleccionada.lon),
        };


        let evento;
        if (editingEvento) {
            evento = {
                nombre_evento: formData.nombre_evento,
                descripcion_evento: formData.descripcion_evento,
                fecha_evento_inicio: formData.fecha_evento_inicio,
                fecha_evento_fin: formData.fecha_evento_fin,
            };
        }
        else {
            evento = {
                nombre_evento: formData.nombre_evento,
                descripcion_evento: formData.descripcion_evento,
                fecha_evento_inicio: formData.fecha_evento_inicio,
                fecha_evento_fin: formData.fecha_evento_fin,
                direccion: JSON.stringify(direccion),
            };
        }

        try {
            const token = localStorage.getItem("token");
            const url = editingEvento
                ? `${API_BASE_URL}/eventos-cientificos/${editingEvento.id_evento}`
                : `${API_BASE_URL}/eventos-cientificos/crear-evento-cientifico`;
            const method = editingEvento ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(evento),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Error al guardar el evento");
                return;
            }

            setSuccess(editingEvento ? "Evento actualizado con éxito." : "Evento creado con éxito.");
            fetchEventos();
            closeForm();
        }
        catch {
            setError("Error al comunicar con el servidor");
        }
    };

    const openNewForm = () => {
        setEditingEvento(null);
        setFormData({
            nombre_evento: "",
            descripcion_evento: "",
            fecha_evento_inicio: "",
            fecha_evento_fin: "",
            provincia: "",
            calleInput: "",
            direccionExtra: "",
        });
        setCalleSeleccionada(null);
        setCalles([]);
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const openEditForm = (evento) => {
        setEditingEvento(evento);

        let direccion = {};
        try {
            direccion = JSON.parse(evento.direccion);
        } catch {
            direccion = {};
        }

        setFormData({
            nombre_evento: evento.nombre_evento,
            descripcion_evento: evento.descripcion_evento,
            fecha_evento_inicio: evento.fecha_evento_inicio.slice(0, 16),
            fecha_evento_fin: evento.fecha_evento_fin.slice(0, 16),
            provincia: direccion.provincia || "",
            calleInput: direccion.calle || "",
            direccionExtra: direccion.extra || "",
        });
        setCalleSeleccionada({
            display_name: direccion.calle || "",
            address: direccion,
            lat: direccion.latitud || 0,
            lon: direccion.longitud || 0,
            place_id: 1,
        });
        setCalles([]);
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingEvento(null);
        setFormData({
            nombre_evento: "",
            descripcion_evento: "",
            fecha_evento_inicio: "",
            fecha_evento_fin: "",
            provincia: "",
            calleInput: "",
            direccionExtra: "",
        });
        setCalleSeleccionada(null);
        setCalles([]);
        setError("");
    };

    const handleDelete = async (evento) => {
        if (!window.confirm(`¿Eliminar evento "${evento.nombre_evento}"?`)) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE_URL}/eventos-cientificos/${evento.id_evento}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Error al eliminar evento");
                return;
            }
            setSuccess("Evento eliminado correctamente.");
            fetchEventos();
        }
        catch {
            setError("Error al comunicar con el servidor");
        }
    };

    const formatFechaEvento = (evento) => {
        const fechaInicio = new Date(evento.fecha_evento_inicio);
        const fechaFin = new Date(evento.fecha_evento_fin);
        const fecha = fechaInicio.toLocaleDateString("es-ES", {
            day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
        });
        const horaInicio = fechaInicio.toLocaleTimeString("es-ES", {
            hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC",
        });
        const horaFin = fechaFin.toLocaleTimeString("es-ES", {
            hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC",
        });
        return `${fecha}, ${horaInicio} - ${horaFin}`;
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de eventos</h2>
                <button
                    onClick={openNewForm}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    NUEVO EVENTO
                </button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 shadow-sm">{error}</div>}
            {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg mb-6 shadow-sm">{success}</div>}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
                    <p className="text-gray-500 font-medium">Cargando eventos...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {eventos.map((evento) => (
                        <div key={evento.id_evento} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white hover:border-indigo-100 transition duration-300">
                            <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-100 gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{evento.nombre_evento}</h3>
                                    {evento.descripcion_evento && (
                                        <p className="text-sm text-gray-600 mt-1 break-words">{evento.descripcion_evento}</p>
                                    )}
                                    <div className="text-xs text-gray-400 mt-1 font-medium">
                                        📅 {formatFechaEvento(evento)}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end md:self-center">
                                    <button
                                        onClick={() => openEditForm(evento)}
                                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-md transition font-semibold flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                                    >
                                        <FaEdit size={10} /> EDITAR
                                    </button>
                                    <button
                                        onClick={() => handleDelete(evento)}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md transition font-semibold flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                                    >
                                        <FaTrash size={10} /> ELIMINAR
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {eventos.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">No hay eventos registrados.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Crear/Editar Evento */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start overflow-auto pt-10 z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                            {editingEvento ? "Editar Evento" : "Nuevo Evento"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="evt-nombre" className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Evento *</label>
                                <input
                                    id="evt-nombre"
                                    type="text"
                                    name="nombre_evento"
                                    value={formData.nombre_evento}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="evt-desc" className="block text-sm font-semibold text-gray-700 mb-1">Descripción *</label>
                                <textarea
                                    id="evt-desc"
                                    name="descripcion_evento"
                                    value={formData.descripcion_evento}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="evt-inicio" className="block text-sm font-semibold text-gray-700 mb-1">Fecha Inicio *</label>
                                    <input
                                        id="evt-inicio"
                                        type="datetime-local"
                                        name="fecha_evento_inicio"
                                        value={formData.fecha_evento_inicio}
                                        onChange={handleInputChange}
                                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="evt-fin" className="block text-sm font-semibold text-gray-700 mb-1">Fecha Fin *</label>
                                    <input
                                        id="evt-fin"
                                        type="datetime-local"
                                        name="fecha_evento_fin"
                                        value={formData.fecha_evento_fin}
                                        onChange={handleInputChange}
                                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            {!editingEvento && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="evt-prov" className="block text-sm font-semibold text-gray-700 mb-1">Provincia *</label>
                                            <select
                                                id="evt-prov"
                                                name="provincia"
                                                value={formData.provincia}
                                                onChange={handleInputChange}
                                                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                required
                                            >
                                                <option value="">Seleccione provincia</option>
                                                <option value="A Coruña">A Coruña</option>
                                                <option value="Álava">Álava</option>
                                                <option value="Albacete">Albacete</option>
                                                <option value="Alicante">Alicante</option>
                                                <option value="Almería">Almería</option>
                                                <option value="Asturias">Asturias</option>
                                                <option value="Ávila">Ávila</option>
                                                <option value="Badajoz">Badajoz</option>
                                                <option value="Barcelona">Barcelona</option>
                                                <option value="Burgos">Burgos</option>
                                                <option value="Cáceres">Cáceres</option>
                                                <option value="Cádiz">Cádiz</option>
                                                <option value="Cantabria">Cantabria</option>
                                                <option value="Castellón">Castellón</option>
                                                <option value="Ciudad Real">Ciudad Real</option>
                                                <option value="Córdoba">Córdoba</option>
                                                <option value="Cuenca">Cuenca</option>
                                                <option value="Girona">Girona</option>
                                                <option value="Granada">Granada</option>
                                                <option value="Guadalajara">Guadalajara</option>
                                                <option value="Gipuzkoa">Gipuzkoa</option>
                                                <option value="Huelva">Huelva</option>
                                                <option value="Huesca">Huesca</option>
                                                <option value="Illes Balears">Illes Balears</option>
                                                <option value="Jaén">Jaén</option>
                                                <option value="La Rioja">La Rioja</option>
                                                <option value="Las Palmas">Las Palmas</option>
                                                <option value="León">León</option>
                                                <option value="Lleida">Lleida</option>
                                                <option value="Lugo">Lugo</option>
                                                <option value="Madrid">Madrid</option>
                                                <option value="Málaga">Málaga</option>
                                                <option value="Murcia">Murcia</option>
                                                <option value="Navarra">Navarra</option>
                                                <option value="Ourense">Ourense</option>
                                                <option value="Palencia">Palencia</option>
                                                <option value="Pontevedra">Pontevedra</option>
                                                <option value="Salamanca">Salamanca</option>
                                                <option value="Santa Cruz de Tenerife">Santa Cruz de Tenerife</option>
                                                <option value="Segovia">Segovia</option>
                                                <option value="Sevilla">Sevilla</option>
                                                <option value="Soria">Soria</option>
                                                <option value="Tarragona">Tarragona</option>
                                                <option value="Teruel">Teruel</option>
                                                <option value="Toledo">Toledo</option>
                                                <option value="Valencia">Valencia</option>
                                                <option value="Valladolid">Valladolid</option>
                                                <option value="Bizkaia">Bizkaia</option>
                                                <option value="Zamora">Zamora</option>
                                                <option value="Zaragoza">Zaragoza</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="evt-calle" className="block text-sm font-semibold text-gray-700 mb-1">Calle *</label>
                                            <input
                                                id="evt-calle"
                                                type="text"
                                                name="calleInput"
                                                value={formData.calleInput}
                                                onChange={handleInputChange}
                                                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Busca y selecciona una calle"
                                                autoComplete="off"
                                                required
                                            />
                                            {calles.length > 0 && (
                                                <ul className="border border-gray-200 rounded-lg max-h-40 overflow-auto mt-1 bg-white z-10 relative shadow-sm">
                                                    {calles.map((calle) => (
                                                        <li
                                                            key={calle.place_id}
                                                            onClick={() => {
                                                                setCalleSeleccionada(calle);
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    calleInput: calle.display_name,
                                                                }));
                                                                setCalles([]);
                                                            }}
                                                            className="cursor-pointer hover:bg-indigo-50 px-3 py-2 text-sm transition"
                                                        >
                                                            {calle.display_name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="evt-extra" className="block text-sm font-semibold text-gray-700 mb-1">Dirección adicional (p.ej., nº, piso, detalles)</label>
                                        <input
                                            id="evt-extra"
                                            type="text"
                                            name="direccionExtra"
                                            value={formData.direccionExtra}
                                            onChange={handleInputChange}
                                            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Opcional"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition font-semibold"
                                >
                                    {editingEvento ? "Actualizar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventos;