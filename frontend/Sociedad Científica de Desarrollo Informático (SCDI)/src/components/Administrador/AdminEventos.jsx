import { useEffect, useState } from "react";

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
                "https://tfg-sociedad-cientifica-production.up.railway.app/listado-eventos-cientificos",
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
            const url = `https://tfg-sociedad-cientifica-production.up.railway.app/buscar-calles?provincia=${encodeURIComponent(
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
                ? `https://tfg-sociedad-cientifica-production.up.railway.app/eventos-cientificos/${editingEvento.id_evento}`
                : "https://tfg-sociedad-cientifica-production.up.railway.app/eventos-cientificos/crear-evento-cientifico";
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

            setSuccess(editingEvento ? "Evento actualizado." : "Evento creado.");
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
        setSuccess("");
    };

    const handleDelete = async (evento) => {
        if (!window.confirm(`¿Eliminar evento "${evento.nombre_evento}"?`)) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `https://tfg-sociedad-cientifica-production.up.railway.app/eventos-cientificos/${evento.id_evento}`,
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

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Gestión de Eventos</h2>
                <button
                    onClick={openNewForm}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 cursor-pointer"
                >
                    NUEVO EVENTO
                </button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>}

            {loading ? (
                <p>Cargando eventos...</p>
            ) : (
                <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-gray-300 px-3 py-2">ID</th>
                            <th className="border border-gray-300 px-3 py-2">Nombre evento</th>
                            <th className="border border-gray-300 px-3 py-2">Fecha</th>
                            <th className="border border-gray-300 px-3 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventos.map((evento) => (
                            <tr key={evento.id_evento}>
                                <th className="border border-gray-300 px-3 py-2">{evento.id_evento}</th>
                                <td className="border border-gray-300 px-3 py-2">{evento.nombre_evento}</td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    <span>
                                        {(() => {
                                        const fechaInicio = new Date(evento.fecha_evento_inicio);
                                        const fechaFin = new Date(evento.fecha_evento_fin);

                                        const fecha = fechaInicio.toLocaleDateString("es-ES", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                            timeZone: "UTC",
                                        });

                                        const horaInicio = fechaInicio.toLocaleTimeString("es-ES", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                            timeZone: "UTC",
                                        });

                                        const horaFin = fechaFin.toLocaleTimeString("es-ES", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                            timeZone: "UTC",
                                        });

                                        return `${fecha}, ${horaInicio} - ${horaFin}`;
                                        })()}
                                    </span>
                                </td>
                                <th className="border border-gray-300 px-3 py-2 space-x-2">
                                    <button
                                        onClick={() => openEditForm(evento)}
                                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded cursor-pointer"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(evento)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded cursor-pointer"
                                    >
                                        Eliminar
                                    </button>
                                </th>
                            </tr>
                        ))}
                        {eventos.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-600 italic">
                                    No hay eventos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start overflow-auto pt-10 z-50">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg"
                    >
                        <h3 className="text-xl font-semibold mb-4">
                            {editingEvento ? "Editar Evento" : "Nuevo Evento"}
                        </h3>

                        <label className="block mb-3">
                            Nombre del Evento *
                            <input
                                type="text"
                                name="nombre_evento"
                                value={formData.nombre_evento}
                                onChange={handleInputChange}
                                className="border rounded px-3 py-2 mt-1 w-full"
                                required
                            />
                        </label>

                        <label className="block mb-3">
                            Descripción *
                            <textarea
                                name="descripcion_evento"
                                value={formData.descripcion_evento}
                                onChange={handleInputChange}
                                className="border rounded px-3 py-2 mt-1 w-full"
                                rows={3}
                                required
                            />
                        </label>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <label>
                                Fecha Inicio *
                                <input
                                    type="datetime-local"
                                    name="fecha_evento_inicio"
                                    value={formData.fecha_evento_inicio}
                                    onChange={handleInputChange}
                                    className="border rounded px-3 py-2 mt-1 w-full"
                                    required
                                />
                            </label>
                            <label>
                                Fecha Fin *
                                <input
                                    type="datetime-local"
                                    name="fecha_evento_fin"
                                    value={formData.fecha_evento_fin}
                                    onChange={handleInputChange}
                                    className="border rounded px-3 py-2 mt-1 w-full"
                                    required
                                />
                            </label>
                        </div>

                    
                        {!editingEvento && (
                            <>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <label>
                                        Provincia *
                                        <select
                                            name="provincia"
                                            value={formData.provincia}
                                            onChange={handleInputChange}
                                            className="border rounded px-3 py-2 mt-1 w-full"
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
                                    </label>

                                    <label>
                                        Calle *
                                        <input
                                            type="text"
                                            name="calleInput"
                                            value={formData.calleInput}
                                            onChange={handleInputChange}
                                            className="border rounded px-3 py-2 mt-1 w-full"
                                            placeholder="Busca y selecciona una calle"
                                            autoComplete="off"
                                            required
                                        />
                                        {calles.length > 0 && (
                                            <ul className="border rounded max-h-40 overflow-auto mt-1 bg-white z-10 relative">
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
                                                    className="cursor-pointer hover:bg-indigo-100 px-2 py-1"
                                                >
                                                    {calle.display_name}
                                                </li>
                                                ))}
                                            </ul>
                                        )}
                                    </label>
                                </div>

                                <label className="block mb-3">
                                    Dirección adicional (p.ej., nº, piso, detalles)
                                    <input
                                        type="text"
                                        name="direccionExtra"
                                        value={formData.direccionExtra}
                                        onChange={handleInputChange}
                                        className="border rounded px-3 py-2 mt-1 w-full"
                                        placeholder="Opcional"
                                    />
                                </label>
                            </>
                        )}

                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 cursor-pointer"
                            >
                                {editingEvento ? "Actualizar" : "Crear"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminEventos;