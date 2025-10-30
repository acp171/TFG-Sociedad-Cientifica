import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [status, setStatus] = useState(null);
    const [msg, setMsg] = useState('');

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
            const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/auth/reset-password`, {
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
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Restablecer contraseña</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Nueva contraseña" className="w-full border px-3 py-2 rounded" />
                <input type="password" required value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Confirmar contraseña" className="w-full border px-3 py-2 rounded" />
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Cambiar contraseña</button>
            </form>

            {status && (
                <div className={`mt-4 p-3 rounded ${status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {msg}
                </div>
            )}
        </div>
    );
}