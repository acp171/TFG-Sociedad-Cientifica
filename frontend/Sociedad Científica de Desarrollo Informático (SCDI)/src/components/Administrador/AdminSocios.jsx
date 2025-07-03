import { useEffect, useState } from "react";

const AdminSocios = () => {
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        email: "",
        password: "",
        telefono: "",
        fecha_nacimiento: "",
        id_plan: "",
    });
    const [showForm, setShowForm] = useState(false);

    const planes = [
        { id: 1, nombre: "Socio / Titular" },
        { id: 2, nombre: "Estudiante / Junior" },
        { id: 3, nombre: "Profesional" },
        { id: 4, nombre: "Honorario" },
        { id: 5, nombre: "Internacional" },
        { id: 6, nombre: "Corporación" },
    ];

    useEffect(() => {
        fetchSocios();
    }, []);

    const fetchSocios = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                "https://tfg-sociedad-cientifica-production.up.railway.app/socios/listado-socios",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

            const data = await res.json();
            setSocios(data.socios?.listaSocios || []);
        }
        catch (err) {
            console.error("Error cargando socios:", err);
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

        if (
            !formData.nombre ||
            !formData.apellidos ||
            !formData.email ||
            !formData.password ||
            !formData.id_plan
        ) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                "https://tfg-sociedad-cientifica-production.up.railway.app/socios/crear-socios",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.message || "Error creando nuevo socio.");
                return;
            }

            fetchSocios();
            setFormData({
                nombre: "",
                apellidos: "",
                email: "",
                password: "",
                telefono: "",
                fecha_nacimiento: "",
                id_plan: "",
            });
            setShowForm(false);
        }
        catch {
            alert("Error creando nuevo socio.");
        }
    };

    return (
        <div>
            <button
                className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer"
                onClick={() => setShowForm(true)}
            >
                NUEVO SOCIO
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
                            <tr key={socio.id_socio}>
                                <th className="border px-2 py-1">{socio.id_socio}</th>
                                <td className="border px-2 py-1">
                                    {socio.nombre} {socio.apellidos}
                                </td>
                                <td className="border px-2 py-1">{socio.email}</td>
                                <td className="border px-2 py-1">{socio.socio_rol}</td>
                                <td className="border px-2 py-1">{socio.plan}</td>
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
                        Nombre *
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
                        Apellidos *
                        <input
                            type="text"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleChange}
                            className="border px-2 py-1 w-full"
                            required
                        />
                    </label>

                    <label className="block mb-2">
                        Email *
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="border px-2 py-1 w-full"
                            required
                        />
                    </label>

                    <label className="block mb-2">
                        Contraseña *
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="border px-2 py-1 w-full"
                            required
                        />
                    </label>

                    <label className="block mb-2">
                        Teléfono
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="border px-2 py-1 w-full"
                        />
                    </label>

                    <label className="block mb-2">
                        Fecha de nacimiento
                        <input
                            type="date"
                            name="fecha_nacimiento"
                            value={formData.fecha_nacimiento}
                            onChange={handleChange}
                            className="border px-2 py-1 w-full"
                        />
                    </label>

                    <label className="block mb-2">
                        Plan *
                        <select
                            name="id_plan"
                            value={formData.id_plan}
                            onChange={handleChange}
                            className="border px-2 py-1 w-full"
                            required
                        >
                        <option value="">Selecciona un plan</option>
                            {planes.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.nombre}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded mt-2 cursor-pointer"
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            className="bg-gray-400 text-white px-4 py-2 rounded mt-2 cursor-pointer"
                            onClick={() => {
                                setShowForm(false);
                                setFormData({
                                nombre: "",
                                apellidos: "",
                                email: "",
                                password: "",
                                telefono: "",
                                fecha_nacimiento: "",
                                id_plan: "",
                                });
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