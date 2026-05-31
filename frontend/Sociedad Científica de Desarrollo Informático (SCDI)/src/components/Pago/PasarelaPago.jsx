import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FiLock, FiX, FiCreditCard, FiCheckCircle } from "react-icons/fi";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const FormularioPago = ({ importe, descripcion, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [exito, setExito] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcesando(true);
        setError("");

        const { error: stripeError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href, // O podrías usar una página específica de éxito
            },
            redirect: "if_required",
        });

        if (stripeError) {
            setError(stripeError.message || "Error al procesar el pago.");
            setProcesando(false);
        } else {
            setExito(true);
            setTimeout(() => onSuccess(), 1500);
        }
    };

    if (exito) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <FiCheckCircle className="text-green-500 text-6xl animate-bounce" />
                <p className="text-xl font-bold text-green-600">¡Pago completado!</p>
                <p className="text-gray-500 text-sm">Redirigiendo...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resumen de pago */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">Total a pagar</p>
                    <p className="text-2xl font-extrabold text-indigo-800">{importe} €</p>
                    {descripcion && <p className="text-sm text-indigo-600 mt-0.5">{descripcion}</p>}
                </div>
                <FiCreditCard className="text-indigo-400 text-4xl" />
            </div>

            {/* Widget de Stripe Elements */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-white">
                <div className="p-4">
                    <PaymentElement
                        options={{
                            layout: "tabs",
                            fields: { billingDetails: { name: "auto" } },
                        }}
                    />
                </div>
            </div>

            {/* Error inline */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
                    <span className="mt-0.5">⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={procesando}
                    className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all disabled:opacity-40"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={!stripe || procesando}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {procesando ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Procesando...
                        </>
                    ) : (
                        <>
                            <FiLock className="text-sm" />
                            Pagar {importe} €
                        </>
                    )}
                </button>
            </div>

            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <FiLock className="text-xs" />
                Pago seguro con cifrado SSL. No almacenamos datos de tarjeta.
            </p>
        </form>
    );
};

const PasarelaPago = ({ clientSecret, importe, descripcion, onSuccess, onCancel }) => {
    if (!clientSecret) return null;

    const appearance = {
        theme: "stripe",
        variables: {
            colorPrimary: "#4f46e5",
            colorBackground: "#ffffff",
            colorText: "#1f2937",
            colorDanger: "#dc2626",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
        },
    };

    const options = { clientSecret, appearance, locale: "es" };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fondo difuminado */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal de pago */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in max-h-[90vh] overflow-y-auto">
                {/* Cabecera */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 rounded-xl p-2">
                            <FiCreditCard className="text-indigo-600 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Pasarela de pago</h2>
                            <p className="text-xs text-gray-400">Powered by Stripe</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition rounded-lg p-1 hover:bg-gray-100"
                        aria-label="Cerrar"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                <Elements stripe={stripePromise} options={options}>
                    <FormularioPago
                        importe={importe}
                        descripcion={descripcion}
                        onSuccess={onSuccess}
                        onCancel={onCancel}
                    />
                </Elements>
            </div>
        </div>
    );
};

export default PasarelaPago;
