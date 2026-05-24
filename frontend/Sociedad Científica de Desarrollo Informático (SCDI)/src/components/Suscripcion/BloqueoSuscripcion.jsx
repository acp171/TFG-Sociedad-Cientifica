import { useState } from "react";
import { useAuth } from "../../hooks/AuthContext";
import PasarelaPago from "../Pago/PasarelaPago";

export default function BloqueoSuscripcion() {
    const { isLoggedIn, suscripcionCaducada, marcarRenovado } = useAuth();
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [importe, setImporte] = useState(0);
    const [renovado, setRenovado] = useState(false);

    // Solo renderizar si el usuario está logueado y su suscripción ha caducado
    if (!isLoggedIn || !suscripcionCaducada) return null;

    const handleIniciarRenovacion = async () => {
        setCargando(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://tfg-sociedad-cientifica-production.up.railway.app/renovar-suscripcion", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                if (data.renovado) {
                    // Plan gratuito: el backend renovó directo, sin pago
                    marcarRenovado();
                    setRenovado(true);
                } else {
                    setClientSecret(data.clientSecret);
                    setImporte(data.importe);
                }
            } else {
                setError(data.message || "Error al solicitar renovación.");
            }
        } catch {
            setError("Error de conexión al servidor.");
        } finally {
            setCargando(false);
        }
    };

    const handlePagoExito = () => {
        marcarRenovado();
        setRenovado(true);
        setClientSecret(null);
    };

    // Estado: pago completado
    if (renovado) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">¡Suscripción Renovada!</h3>
                    <p className="text-gray-600 mb-6">Tu pago ha sido procesado correctamente. Tienes 30 días adicionales de acceso completo.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl w-full hover:bg-blue-700 transition"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        );
    }

    // Estado: formulario de pago abierto
    if (clientSecret) {
        return (
            <div className="fixed inset-0 z-[60]">
                <PasarelaPago
                    clientSecret={clientSecret}
                    importe={importe}
                    descripcion="Renovación de suscripción mensual"
                    onSuccess={handlePagoExito}
                    onCancel={() => setClientSecret(null)}
                />
            </div>
        );
    }

    // Estado inicial: banner de aviso inmediato al entrar con cuenta caducada
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">

                {/* Cabecera de advertencia */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center text-white">
                    <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0-6V9m-7.938 9h15.876C21.54 18 22.5 16.333 21.732 15L14.732 3c-.77-1.333-2.694-1.333-3.464 0L3.268 15C2.5 16.333 3.46 18 5 18z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold">Suscripción caducada</h2>
                    <p className="mt-1 text-white/80 text-sm">Tu acceso mensual ha expirado</p>
                </div>

                {/* Cuerpo */}
                <div className="p-6">
                    <p className="text-gray-600 text-center mb-5">
                        Para seguir publicando artículos, inscribirte en eventos y participar en proyectos necesitas renovar tu suscripción mensual.
                    </p>

                    {error && (
                        <p className="text-red-500 text-sm mb-4 text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>
                    )}

                    <button
                        onClick={handleIniciarRenovacion}
                        disabled={cargando}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3.5 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition shadow-lg shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed mb-3"
                    >
                        {cargando ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                                Preparando pasarela...
                            </span>
                        ) : "Renovar suscripción ahora"}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                        🔒 Pago seguro con cifrado SSL. Puedes cerrar sesión desde tu perfil.
                    </p>
                </div>
            </div>
        </div>
    );
}
