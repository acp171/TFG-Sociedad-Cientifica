import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasarelaPago from "../../components/Pago/PasarelaPago";

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

    const [universidad, setUniversidad] = useState("");
    const [empresa, setEmpresa] = useState("");

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    // Estado pasarela de pago
    const [clientSecret, setClientSecret] = useState(null);
    const [mostrarPago, setMostrarPago] = useState(false);

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

    // Fase 1: Enviar formulario → obtener clientSecret del backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        try {
            const dataToSend = {
                formData: {
                    ...formData,
                    universidad: selectedPlan.id_tipo_socio === 2 ? universidad : null,
                    empresa: selectedPlan.id_tipo_socio === 6 ? empresa : null,
                },
                plan: selectedPlan,
            };

            const res = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });

            const data = await res.json();

            if (res.ok && data.clientSecret) {
                setClientSecret(data.clientSecret);
                setMostrarPago(true);
            } else {
                setError(data.message || "Error en el registro.");
            }
        } catch (err) {
            console.error("Error en registro:", err);
            setError("Error en el servidor.");
        } finally {
            setCargando(false);
        }
    };

    // Fase 2: Pago completado → navegar al éxito
    const handlePagoExito = () => {
        localStorage.removeItem("planSeleccionado");
        navigate("/registro-exitoso");
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

                <>Nombre</>
                <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>Apellidos</>
                <input type="text" name="apellidos" placeholder="Apellidos" value={formData.apellidos} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>Correo electrónico</>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>Contraseña</>
                <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>Teléfono</>
                <input type="tel" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>Fecha nacimiento</>
                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required className="w-full border p-3 rounded" />

                {selectedPlan?.id_tipo_socio === 2 && (
                    <>
                        <label>Universidad</label>
                        <input type="text" placeholder="Universidad" value={universidad} onChange={(e) => setUniversidad(e.target.value)} required className="w-full border p-3 rounded"/>
                    </>
                )}

                {selectedPlan?.id_tipo_socio === 6 && (
                    <>
                        <label>Nombre de la empresa</label>
                        <input type="text" placeholder="Nombre de la empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} required className="w-full border p-3 rounded"/>
                    </>
                )}

                <Link
                    to="/login"
                    title="Iniciar sesión"
                    className="w-full text-center text-blue-600 hover:text-blue-700"
                >
                    ¿Ya tienes una cuenta?
                </Link>

                <button
                    type="submit"
                    disabled={cargando}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition disabled:opacity-60"
                >
                    {cargando ? "Preparando pago..." : "Registrarse"}
                </button>
            </form>

            {/* Pasarela de pago embebida */}
            {mostrarPago && clientSecret && (
                <PasarelaPago
                    clientSecret={clientSecret}
                    importe={selectedPlan?.cuota}
                    descripcion={`Plan ${selectedPlan?.nombre_tipo}`}
                    onSuccess={handlePagoExito}
                    onCancel={() => setMostrarPago(false)}
                />
            )}
        </section>
    );
};

export default Register;