import API_BASE_URL from '../../config/backendConfig';
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState(null);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMsg('Token no proporcionado');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirm) {
            setStatus('error'); setMsg('Las contraseñas no coinciden'); return;
        }
        if (password.length < 8) {
            setStatus('error'); setMsg('La contraseña debe tener al menos 8 caracteres'); return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error');
            }
            
            setStatus('success');
            setMsg('Contraseña actualizada. Serás redirigido al login...');
            setTimeout(() => navigate('/login'), 2000);
        }
        catch (err) {
            setStatus('error'); setMsg(err.message || 'Error al cambiar contraseña');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-blue-200 to-white">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="mx-auto bg-blue-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Restablecer contraseña</h1>
                    <p className="text-gray-600">Introduce tu nueva contraseña y confírmala para actualizarla.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-lg transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                        <input
                            type="password"
                            required
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="********"
                            className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-lg transition"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md"
                    >
                        Cambiar contraseña
                    </button>
                </form>

                {status && (
                    <div
                        className={`mt-6 p-3 rounded-lg text-sm font-medium ${
                            status === "success"
                                ? "bg-green-50 text-green-800 border border-green-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                    >
                        {msg}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        ← Volver a iniciar sesión
                    </a>
                </div>
            </div>
        </div>
    );
}