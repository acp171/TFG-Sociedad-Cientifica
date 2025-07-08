import { useEffect, useState } from "react";

const AdminEventos = () => {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvento, setEditingEvento] = useState(null);
    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        fecha: "",
    });
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
            const res = await fetch("https://tfg-sociedad-cientifica-production.up.railway.app/listado-eventos-cientificos", {
                headers: { Authorization: `Bearer ${token}` },
            });
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

    const openNewForm = () => {
        setEditingEvento(null);
        setFormData({ titulo: "", descripcion: "", fecha: "" });
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const openEditForm = (evento) => {
        setEditingEvento(evento);
        setFormData({
            titulo: evento.titulo,
            descripcion: evento.descripcion,
            fecha: evento.fecha ? evento.fecha.slice(0, 10) : "",
        });
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingEvento(null);
        setFormData({ titulo: "", descripcion: "", fecha: "" });
        setError("");
        setSuccess("");
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.titulo.trim()) {
            setError("El título es obligatorio");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const url = editingEvento
                ? `https://tfg-sociedad-cientifica-production.up.railway.app/eventos/${editingEvento.id}`
                : "https://tfg-sociedad-cientifica-production.up.railway.app/eventos";
            const method = editingEvento ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
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

    const handleDelete = async (evento) => {
        if (!window.confirm(`¿Eliminar evento "${evento.titulo}"?`)) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `https://tfg-sociedad-cientifica-production.up.railway.app/eventos/${evento.id}`,
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
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
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
                            <th className="border border-gray-300 px-3 py-2">Título</th>
                            <th className="border border-gray-300 px-3 py-2">Fecha</th>
                            <th className="border border-gray-300 px-3 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventos.map((evento) => (
                            <tr key={evento.id}>
                                <td className="border border-gray-300 px-3 py-2">{evento.id}</td>
                                <td className="border border-gray-300 px-3 py-2">{evento.titulo}</td>
                                <td className="border border-gray-300 px-3 py-2">
                                    {evento.fecha ? new Date(evento.fecha).toLocaleDateString() : "-"}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 space-x-2">
                                    <button
                                        onClick={() => openEditForm(evento)}
                                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(evento)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                                    >
                                        Eliminar
                                    </button>
                                </td>
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
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-lg p-6 w-96 max-w-full shadow-lg"
                    >
                        <h3 className="text-xl font-semibold mb-4">
                            {editingEvento ? "Editar Evento" : "Nuevo Evento"}
                        </h3>

                        <label className="block mb-3">
                            Título *
                            <input
                                type="text"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 mt-1 w-full"
                                required
                            />
                        </label>

                        <label className="block mb-3">
                            Descripción *
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 mt-1 w-full"
                                rows={3}
                                required
                            />
                        </label>

                        <label className="block mb-3">
                            Fecha *
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 mt-1 w-full"
                                required
                            />
                        </label>

                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminEventos;