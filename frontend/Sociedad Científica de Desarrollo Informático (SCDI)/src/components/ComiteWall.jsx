import API_BASE_URL from '../../config/backendConfig';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function ComiteWall({ comiteId }) {
    const { t } = useTranslation();
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [loading, setLoading] = useState(true);
    const mensajesEndRef = useRef(null);

    const usuario = JSON.parse(localStorage.getItem('socio'));

    useEffect(() => {
        if (!comiteId) return;

        const cargarMensajes = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/comites/${comiteId}/mensajes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMensajes(data.mensajes || []);
                }
            } catch (error) {
                console.error('Error cargando muro de comite:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarMensajes();
        const interval = setInterval(cargarMensajes, 5000); // Polling cada 5 seg
        return () => clearInterval(interval);
    }, [comiteId]);


    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim() || !comiteId) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/comites/${comiteId}/mensajes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mensaje: nuevoMensaje })
            });

            if (res.ok) {
                const data = await res.json();
                const msgConUsuario = { ...data.mensaje, id_socio: usuario.id, nombre: usuario.nombre, apellidos: usuario.apellidos };
                setMensajes(prev => [...prev, msgConUsuario]);
                setNuevoMensaje('');
            }
        } catch (error) {
            console.error('Error enviando mensaje: ', error);
        }
    };

    if (loading) return <div className="text-gray-500 text-center animate-pulse py-8">Cargando muro del comité...</div>;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mt-12 flex flex-col mb-10 overflow-hidden font-sans">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                    Muro del Comité
                </h3>
                <p className="text-indigo-100 text-sm mt-1">Chat interno y tablón de anuncios para organizadores.</p>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 max-h-[400px]">
                {mensajes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        <p>No hay mensajes aún. ¡Rompe el hielo!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mensajes.map((msg, i) => {
                            const esMio = Number(msg.id_socio) === Number(usuario?.id);
                            const fechaObj = new Date(msg.fecha_envio || new Date());
                            const hora = isNaN(fechaObj.getTime()) ? "" : fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const fechaStr = isNaN(fechaObj.getTime()) ? "" : fechaObj.toLocaleDateString();

                            return (
                                <div key={msg.id_mensaje || i} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${esMio ? 'bg-green-600 text-white rounded-br-none' : 'bg-gray-900 border border-gray-800 text-gray-100 rounded-bl-none'}`}>
                                        {!esMio && <div className="text-xs font-semibold text-green-400 mb-1">{msg.nombre} {msg.apellidos}</div>}
                                        <div className="text-sm break-words whitespace-pre-wrap leading-relaxed">{msg.mensaje}</div>
                                        <div className={`text-[10px] text-right mt-1.5 ${esMio ? 'text-green-200' : 'text-gray-400'}`}>
                                            {fechaStr} {hora}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={mensajesEndRef} />
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={enviarMensaje} className="flex gap-3 relative">
                    <textarea
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        placeholder="Escribe tu mensaje al comité..."
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-14 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-14 overflow-hidden transition-all shadow-inner bg-gray-50"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                enviarMensaje(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!nuevoMensaje.trim()}
                        className="absolute right-2 top-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 shadow-md flex items-center justify-center h-10 w-10"
                    >
                        <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                    </button>
                </form>
                <div className="text-xs text-center mt-2 text-gray-400 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    Comunicación interna exclusiva
                </div>
            </div>
        </div>
    );
}
