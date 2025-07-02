import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        email: "",
        password: "",
        telefono: "",
        fecha_nacimiento: "",
    });

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const plan = JSON.parse(localStorage.getItem("planSeleccionado"));
        if (!plan) {
            navigate("/seleccionar-plan");
        } else {
            setSelectedPlan(plan);
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const dataToSend = {
                formData: formData,
                plan: selectedPlan,
            };

            const res = await fetch("https://tfg-sociedad-cientifica-production.up.railway.app/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess("Registro exitoso. Redirigiendo al login...");
                setTimeout(() => {
                    localStorage.removeItem("planSeleccionado");
                    navigate("/login");
                }, 2000);
            } else {
                setError(data.message || "Error en el registro.");
            }
        } catch (err) {
            console.error("Error en registro:", err);
            setError("Error en el servidor.");
        }
    };

    return (
        <section className="min-h-[80vh] flex flex-col items-center justify-center py-16 px-6 bg-gradient-to-b from-blue-200 to-white">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">REGISTRO DE SOCIOS</h2>

            {selectedPlan && (
                <p className="mb-6 text-indigo-700 font-semibold">
                    Plan seleccionado: <span className="font-bold">{selectedPlan.nombre_tipo}</span> — {selectedPlan.cuota === 0 ? "Gratis" : `${selectedPlan.cuota} €/mes`}
                </p>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-8 max-w-md w-full space-y-5">
                {error && <p className="text-red-600 font-medium">{error}</p>}
                {success && <p className="text-green-600 font-medium">{success}</p>}

                <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required className="w-full border p-3 rounded" />
                <input type="text" name="apellidos" placeholder="Apellidos" value={formData.apellidos} onChange={handleChange} required className="w-full border p-3 rounded" />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full border p-3 rounded" />
                <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required className="w-full border p-3 rounded" />
                <input type="tel" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required className="w-full border p-3 rounded" />
                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required className="w-full border p-3 rounded" />

                <Link
                    to="/login"
                    title="Iniciar sesión"
                    className="w-full text-center text-blue-600 hover:text-blue-700"
                >
                    ¿Ya tienes una cuenta?
                </Link>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition">
                    Registrarse
                </button>
            </form>
        </section>
    );
};

export default Register;