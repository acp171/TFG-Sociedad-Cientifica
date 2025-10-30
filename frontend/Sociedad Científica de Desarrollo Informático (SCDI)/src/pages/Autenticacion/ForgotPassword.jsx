// src/pages/ForgotPassword.jsx
import { useState } from "react";

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null); // success | error | null
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);
        
        try {
            const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
            setStatus('success');
            setMsg('Si existe una cuenta asociada, recibirás un email con instrucciones.');
        } 
        catch (err) {
            setStatus('error');
            setMsg(err.message || 'Error al solicitar restablecimiento');
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">¿Olvidó su contraseña?</h1>
            <p className="mb-4 text-gray-600">Introduce tu correo y recibirás un enlace para restablecerla.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full border px-3 py-2 rounded"
                />
                    <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Enviar enlace</button>
            </form>

            {status && (
                <div className={`mt-4 p-3 rounded ${status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {msg}
                </div>
            )}
        </div>
    );
}