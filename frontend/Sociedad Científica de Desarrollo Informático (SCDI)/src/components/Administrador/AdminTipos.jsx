import { useEffect, useState } from "react";

const AdminTipos = () => {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [formData, setFormData] = useState({
        nombre_tipo: "",
        descripcion: "",
        cuota: "",
        price_stripe: "",
    });

    useEffect(() => {
        fetchTipos();
    }, []);

    const fetchTipos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://tfg-sociedad-cientifica-production.up.railway.app/tipos", {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setTipos(data.tipos || []);
        }
        catch (err) {
            console.error("Error al cargar tipos:", err);
        }
        finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const url = editandoId
        ? `https://tfg-sociedad-cientifica-production.up.railway.app/tipos/${editandoId}`
        : `https://tfg-sociedad-cientifica-production.up.railway.app/tipos`;

        const method = editandoId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Error al guardar tipo");

            await fetchTipos();
            setFormData({ nombre_tipo: "", descripcion: "", cuota: "", price_stripe: "" });
            setEditandoId(null);
            setShowForm(false);
        }
        catch (err) {
            console.error(err);
            alert("Error guardando tipo de socio.");
        }
    };

    const handleEdit = (tipo) => {
        setFormData({
            nombre_tipo: tipo.nombre_tipo,
            descripcion: tipo.descripcion,
            cuota: tipo.cuota,
            price_stripe: tipo.price_stripe,
        });
        setEditandoId(tipo.id_tipo_socio);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este tipo de socio?")) return;

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/tipos/${id}`, {
                method: "DELETE",
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Error al eliminar tipo");

            fetchTipos();
        }
        catch (err) {
            console.error(err);
            alert("No se pudo eliminar el tipo.");
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Gestión de Tipos de Socio</h2>

            <button
                onClick={() => {
                    setShowForm(true);
                    setEditandoId(null);
                    setFormData({ nombre_tipo: "", descripcion: "", cuota: "", price_stripe: "" });
                }}
                className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer"
            >
                NUEVO TIPO
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-white max-w-md">
                    <h3 className="mb-4 font-bold">{editandoId ? "EDITAR TIPO" : "CREAR TIPO DE SOCIO"}</h3>

                    <label className="block mb-2">
                        Nombre del tipo *
                        <input
                            type="text"
                            name="nombre_tipo"
                            value={formData.nombre_tipo}
                            onChange={handleChange}
                            className="border px-2 py-1 w-full"
                            required
                        />
                    </label>

                    <label className="block mb-2">
                        Descripción
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            className="border px-2 py-1 w-full"
                        />
                    </label>

                    <label className="block mb-2">
                        Cuota mensual (€) *
                        <input
                            type="number"
                            step="0.01"
                            name="cuota"
                            value={formData.cuota}
                            onChange={handleChange}
                            className="border px-2 py-1 w-full"
                            required
                        />
                    </label>

                    <label className="block mb-2">
                        ID Stripe (price_id) *
                        <input
                            type="text"
                            name="price_stripe"
                            value={formData.price_stripe}
                            onChange={handleChange}
                            className="border px-2 py-1 w-full"
                            required
                        />
                    </label>

                    <div className="flex gap-4 mt-4">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded"
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setEditandoId(null);
                                setFormData({ nombre_tipo: "", descripcion: "", cuota: "", price_stripe: "" });
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <p>Cargando tipos de socio...</p>
            ) : (
                <table className="w-full border">
                    <thead>
                        <tr className="bg-indigo-100">
                            <th className="border px-2 py-1">ID</th>
                            <th className="border px-2 py-1">Nombre</th>
                            <th className="border px-2 py-1">Descripción</th>
                            <th className="border px-2 py-1">Cuota (€)</th>
                            <th className="border px-2 py-1">Stripe</th>
                            <th className="border px-2 py-1">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tipos.map((tipo) => (
                            <tr key={tipo.id_tipo_socio}>
                                <th className="border px-2 py-1">{tipo.id_tipo_socio}</th>
                                <td className="border px-2 py-1">{tipo.nombre_tipo}</td>
                                <td className="border px-2 py-1">{tipo.descripcion}</td>
                                <td className="border px-2 py-1">{tipo.cuota}</td>
                                <td className="border px-2 py-1">{tipo.price_stripe}</td>
                                <th className="border px-2 py-1 space-x-2">
                                    <button
                                        onClick={() => handleEdit(tipo)}
                                        className="bg-yellow-500 text-white px-2 py-1 rounded cursor-pointer"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tipo.id_tipo_socio)}
                                        className="bg-red-600 text-white px-2 py-1 rounded cursor-pointer"
                                    >
                                        Eliminar
                                    </button>
                                </th>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminTipos;