import { useEffect, useState } from "react";
import PasarelaPago from "../Pago/PasarelaPago";
import { Link } from "react-router-dom";

export default function BloqueoSuscripcion() {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [mostrarModalPago, setMostrarModalPago] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [importe, setImporte] = useState(0);
    const [renovado, setRenovado] = useState(false);

    useEffect(() => {
        // Intercept fetch responses to look for 403 "requiereRenovacion"
        const originalFetch = window.fetch;
        window.fetch = async function () {
            const response = await originalFetch.apply(this, arguments);
            const clone = response.clone();
            
            if (response.status === 403) {
                clone.json().then(data => {
                    if (data && data.requiereRenovacion) {
                        setMostrarModalPago(true);
                    }
                }).catch(() => {});
            }
            return response;
        };
        
        return () => {
            window.fetch = originalFetch; // Restore on unmount
        };
    }, []);

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
                if (data.renovado) { // Si el plan es gratuito (0€), el backend no da clientSecret, renueva directo
                    setRenovado(true);
                } else {
                    setClientSecret(data.clientSecret);
                    setImporte(data.importe);
                }
            } else {
                setError(data.message || "Error al solicitar renovación.");
            }
        } catch (err) {
            setError("Error de conexión al servidor.");
        } finally {
            setCargando(false);
        }
    };

    const handleSuccess = () => {
        setMostrarModalPago(false);
        setClientSecret(null);
        setRenovado(true);
    };

    if (renovado) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                    <h3 className="text-2xl font-bold text-green-600 mb-2">¡Suscripción Renovada!</h3>
                    <p className="text-gray-600 mb-6">Tu pago ha sido procesado. Ahora tienes 30 días adicionales de acceso completo a todas tus funciones.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg w-full hover:bg-blue-700 transition"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        );
    }

    if (!mostrarModalPago) return null;

    if (clientSecret) {
        return (
            <div className="fixed inset-0 z-[60]">
                <PasarelaPago 
                    clientSecret={clientSecret} 
                    importe={importe}
                    descripcion={"Renovación de suscripción mensual"}
                    onSuccess={handleSuccess}
                    onCancel={() => setClientSecret(null)}
                />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md transform transition-all">
                <div className="bg-red-50 p-6 text-center border-b border-red-100">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-red-700">Tu suscripción ha caducado</h2>
                    <p className="text-red-600/80 mt-2 font-medium">Esta acción requiere una suscripción activa mensual.</p>
                </div>
                
                <div className="p-6">
                    <p className="text-gray-600 mb-6 text-center">Para poder crear proyectos, publicar artículos o inscribirte en eventos necesitas renovar el pago de tu plan correspondiente.</p>
                    
                    {error && <p className="text-red-500 text-sm mb-4 text-center font-medium bg-red-50 p-2 rounded">{error}</p>}
                    
                    <button 
                        onClick={handleIniciarRenovacion}
                        disabled={cargando}
                        className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed mb-3"
                    >
                        {cargando ? "Preparando pasarela..." : "Renovar suscripción ahora"}
                    </button>
                    
                    <button 
                        onClick={() => setMostrarModalPago(false)}
                        className="w-full bg-white text-gray-500 font-semibold py-2 px-4 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition border border-transparent"
                    >
                        Cancelar y volver
                    </button>
                </div>
            </div>
        </div>
    );
}
