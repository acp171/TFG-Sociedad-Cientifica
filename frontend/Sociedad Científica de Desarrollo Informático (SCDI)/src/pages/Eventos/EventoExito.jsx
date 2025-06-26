import { useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

const EventoExito = () => {
    const { id } = useParams();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = params.get("session_id");

    useEffect(() => {
        if (sessionId) {
            // Aquí podrías mostrar algún estado cargando si quieres validar la sesión con Stripe
            console.log("Sesión de Stripe confirmada:", sessionId);
        }
    }, [sessionId]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="bg-white p-8 rounded shadow-md text-center">
                <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago exitoso!</h1>
                <p className="text-gray-700 mb-6">Tu inscripción ha sido confirmada correctamente.</p>
                <button
                    onClick={() => navigate(`/eventos-cientificos/${id}`)}
                    className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Volver a eventos
                </button>
            </div>
        </div>
    );
};

export default EventoExito;