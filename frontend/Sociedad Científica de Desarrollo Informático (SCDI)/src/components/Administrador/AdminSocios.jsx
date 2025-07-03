import { useEffect, useState } from "react";

const AdminSocios = () => {
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ nombre: "", email: "" });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchSocios();
    }, []);

    const fetchSocios = async () => {
        setLoading(true);
        try {
            const res = await fetch('https://tfg-sociedad-cientifica-production.up.railway.app/socios/listado-socios');
            const data = await res.json();
            setSocios(data);
        } catch (e) {
            alert("Error cargando socios");
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('https://tfg-sociedad-cientifica-production.up.railway.app/socios/crear-socios', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            fetchSocios();
            setFormData({ nombre: "", email: "" });
            setShowForm(false);
        } catch {
            alert("Error creando socio");
        }
    };

    return (
        <div>
            <button
                className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded"
                onClick={() => setShowForm(true)}
            >
                Crear socio
            </button>

            {loading ? (
                <p>Cargando socios...</p>
            ) : (
                <table className="w-full border">
                    <thead>
                        <tr className="bg-indigo-100">
                            <th className="border px-2 py-1">ID</th>
                            <th className="border px-2 py-1">Nombre</th>
                            <th className="border px-2 py-1">Email</th>
                            <th className="border px-2 py-1">Rol</th>
                            <th className="border px-2 py-1">Plan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {socios.map((socio) => (
                        <tr key={socio.id}>
                            <td className="border px-2 py-1">{socio.id}</td>
                            <td className="border px-2 py-1">{socio.nombre} {socio.apellidos}</td>
                            <td className="border px-2 py-1">{socio.email}</td>
                            <th className="border px-2 py-1">{socio.socio_rol}</th>
                            <th className="border px-2 py-1">{socio.plan}</th>
                        </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mt-6 p-4 border rounded max-w-md bg-white"
                >
                    <h3 className="mb-4 font-bold">CREAR SOCIO</h3>
                    <label className="block mb-2">
                        Nombre
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="border px-2 py-1 w-full"
                            required
                        />
                    </label>
                    <label className="block mb-2">
                        Email
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="border px-2 py-1 w-full"
                            required
                        />
                    </label>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            className="bg-gray-400 text-white px-4 py-2 rounded mt-2"
                            onClick={() => {
                                setShowForm(false);
                                setFormData({ nombre: "", email: "" });
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AdminSocios;