import { useEffect, useState } from "react";

const AdminProyectos = () => {
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProyecto, setEditingProyecto] = useState(null);
    const [formData, setFormData] = useState({
        nombre_proyecto: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchProyectos();
    }, []);

    const fetchProyectos = async () => {
        setLoading(true);
        try {
        const token = localStorage.getItem("token");
        const res = await fetch(
            "https://tfg-sociedad-cientifica-production.up.railway.app/listado-proyectos-investigacion",
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );
        if (!res.ok) throw new Error("Error al obtener los proyectos");
        const data = await res.json();
        setProyectos(data.proyectos?.listaProyectos || []);
        } catch (err) {
        setError("Error cargando proyectos");
        } finally {
        setLoading(false);
        }
    };

    const openNewForm = () => {
        setEditingProyecto(null);
        setFormData({ nombre_proyecto: "", descripcion: "", fecha_inicio: "", fecha_fin: "" });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (proyecto) => {
        setEditingProyecto(proyecto);
        setFormData({
        nombre_proyecto: proyecto.nombre_proyecto || "",
        descripcion: proyecto.descripcion || "",
        fecha_inicio: proyecto.fecha_inicio
            ? new Date(proyecto.fecha_inicio).toISOString().slice(0, 10)
            : "",
        fecha_fin: proyecto.fecha_fin
            ? new Date(proyecto.fecha_fin).toISOString().slice(0, 10)
            : "",
        });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setFormData({ nombre_proyecto: "", descripcion: "", fecha_inicio: "", fecha_fin: "" });
        setEditingProyecto(null);
        setError("");
        setSuccess("");
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre_proyecto.trim()) {
        setError("El título es obligatorio");
        return;
        }

        try {
        const token = localStorage.getItem("token");
        const url = editingProyecto
            ? `https://tfg-sociedad-cientifica-production.up.railway.app/proyectos-investigacion/${editingProyecto.id_proyecto || editingProyecto.id}`
            : "https://tfg-sociedad-cientifica-production.up.railway.app/proyectos-investigacion/crear-proyecto-investigacion";
        const method = editingProyecto ? "PUT" : "POST";

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
            setError(data.message || "Error en la operación");
            return;
        }

        setSuccess(editingProyecto ? "Proyecto actualizado." : "Proyecto creado.");
        fetchProyectos();
        closeForm();
        } catch (err) {
        setError("Error al comunicarse con el servidor");
        }
    };

    const handleDelete = async (proyecto) => {
        if (
        !window.confirm(
            `¿Seguro que quieres eliminar el proyecto "${proyecto.nombre_proyecto}"?`
        )
        )
        return;

        try {
        const token = localStorage.getItem("token");
        const res = await fetch(
            `https://tfg-sociedad-cientifica-production.up.railway.app/proyectos-investigacion/${proyecto.id_proyecto || proyecto.id}`,
            {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
            }
        );

        const data = await res.json();

        if (!res.ok) {
            setError(data.message || "No se pudo eliminar el proyecto");
            return;
        }

        setSuccess("Proyecto eliminado correctamente.");
        fetchProyectos();
        } catch (err) {
        setError("Error al comunicarse con el servidor");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Gestión de Proyectos</h2>
                <button
                    onClick={openNewForm}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                    Nuevo Proyecto
                </button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
            {success && (
                <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>
            )}

            {loading ? (
                <p>Cargando proyectos...</p>
            ) : (
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-indigo-100">
                        <th className="border border-gray-300 px-3 py-1">ID</th>
                        <th className="border border-gray-300 px-3 py-1">Título</th>
                        <th className="border border-gray-300 px-3 py-1">Descripción</th>
                        <th className="border border-gray-300 px-3 py-1">Fecha inicio</th>
                        <th className="border border-gray-300 px-3 py-1">Fecha fin</th>
                        <th className="border border-gray-300 px-3 py-1">Estado</th>
                        <th className="border border-gray-300 px-3 py-1">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proyectos.map((proyecto) => (
                            <tr key={proyecto.id_proyecto || proyecto.id}>
                                <th className="border border-gray-300 px-3 py-1">{proyecto.id_proyecto}</th>
                                <td className="border border-gray-300 px-3 py-1">{proyecto.nombre_proyecto}</td>
                                <td className="border border-gray-300 px-3 py-1">{proyecto.descripcion}</td>
                                <td className="border border-gray-300 px-3 py-1">
                                    {proyecto.fecha_inicio
                                        ? new Date(proyecto.fecha_inicio).toLocaleDateString()
                                        : ""}
                                </td>
                                <td className="border border-gray-300 px-3 py-1">
                                    {proyecto.fecha_fin
                                        ? new Date(proyecto.fecha_fin).toLocaleDateString()
                                        : ""}
                                </td>
                                <td className="border border-gray-300 px-3 py-1">{proyecto.estado}</td>
                                <td className="border border-gray-300 px-3 py-1 space-x-2">
                                <button
                                    onClick={() => openEditForm(proyecto)}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(proyecto)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                                >
                                    Eliminar
                                </button>
                                </td>
                            </tr>
                        ))}
                        {proyectos.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-600 italic">
                                No hay proyectos.
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
                        {editingProyecto ? "Editar Proyecto" : "Nuevo Proyecto"}
                        </h3>

                        <label className="block mb-3">
                            Nombre del proyecto *
                            <input
                                type="text"
                                name="nombre_proyecto"
                                value={formData.nombre_proyecto}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 mt-1 w-full"
                                required
                            />
                        </label>

                        <label className="block mb-3">
                            Descripción
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 mt-1 w-full"
                                rows={3}
                            />
                        </label>

                        <label className="block mb-3">
                            Fecha inicio
                            <input
                                type="date"
                                name="fecha_inicio"
                                value={formData.fecha_inicio}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 mt-1 w-full"
                            />
                        </label>

                        <label className="block mb-3">
                            Fecha fin
                            <input
                                type="date"
                                name="fecha_fin"
                                value={formData.fecha_fin}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 mt-1 w-full"
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

export default AdminProyectos;