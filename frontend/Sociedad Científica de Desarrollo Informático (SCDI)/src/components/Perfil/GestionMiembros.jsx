import { useState, useEffect } from "react";

const GestionMiembros = () => {
    const [miembros, setMiembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevoMiembro, setNuevoMiembro] = useState({
        nombre: "",
        apellidos: "",
        email: "",
        password: "",
        telefono: "",
        fecha_nacimiento: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchMiembros = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(
                    "https://tfg-sociedad-cientifica-production.up.railway.app/corporacion/miembros",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!res.ok) {
                    throw new Error("Error al cargar miembros");
                }
                
                const data = await res.json();
                setMiembros(data.miembros || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMiembros();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNuevoMiembro((prev) => ({ ...prev, [name]: value }));
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");

        try {
            const token = localStorage.getItem("token");
            console.log(token);
            const res = await fetch(
                "https://tfg-sociedad-cientifica-production.up.railway.app/corporacion/miembros",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(nuevoMiembro),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al añadir miembro");

            setMiembros((prev) => [...prev, data.miembro]);
            setNuevoMiembro({ nombre: "", apellidos: "", email: "", password: "", telefono: "", fecha_nacimiento: "",});
            setSuccess("Miembro añadido correctamente");
        }
        catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Deseas eliminar este miembro?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `https://tfg-sociedad-cientifica-production.up.railway.app/corporacion/miembros/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) {
                throw new Error("Error al eliminar miembro");
            }

            setMiembros((prev) => prev.filter((m) => m.id_socio !== id));
        }
        catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Miembros de la Corporación</h2>

            {loading ? (
                <p>Cargando miembros...</p>
            ) : miembros.length === 0 ? (
                <p>No hay miembros registrados.</p>
            ) : (
                <table className="w-full mb-6 border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-4 py-2 text-left">Nombre completo</th>
                            <th className="border px-4 py-2 text-left">Email</th>
                            <th className="border px-4 py-2 text-left">Tipo de socio</th>
                            <th className="border px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {miembros.map((m) => (
                            <tr key={m.id_socio} className="hover:bg-gray-100">
                                <td className="border px-4 py-2">{m.nombre} {m.apellidos}</td>
                                <td className="border px-4 py-2">{m.email}</td>
                                <td className="border px-4 py-2">Profesional</td>
                                <td className="border px-4 py-2">
                                    <button
                                        onClick={() => handleDelete(m.id_socio)}
                                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Formulario para añadir miembro */}
            <form onSubmit={handleAdd} className="space-y-3">
                {error && <p className="text-red-600">{error}</p>}
                {success && <p className="text-green-600">{success}</p>}

                <>Nombre</>
                <input type="text" name="nombre" placeholder="Nombre" value={nuevoMiembro.nombre} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>Apellidos</>
                <input type="text" name="apellidos" placeholder="Apellidos" value={nuevoMiembro.apellidos} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>Correo electrónico</>
                <input type="email" name="email" placeholder="Email" value={nuevoMiembro.email} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>Contraseña</>
                <input type="password" name="password" placeholder="Contraseña" value={nuevoMiembro.password} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>Teléfono</>
                <input type="tel" name="telefono" placeholder="Teléfono" value={nuevoMiembro.telefono} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>Fecha nacimiento</>
                <input type="date" name="fecha_nacimiento" value={nuevoMiembro.fecha_nacimiento} onChange={handleChange} required className="w-full border p-3 rounded" />

                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    Añadir miembro
                </button>
            </form>
        </div>
    );
};

export default GestionMiembros;