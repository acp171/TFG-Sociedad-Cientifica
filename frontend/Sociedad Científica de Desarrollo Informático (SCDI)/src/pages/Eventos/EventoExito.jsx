import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const EventoExito = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const socio = JSON.parse(localStorage.getItem("socio") || "{}");

    useEffect(() => {
        // Fetch event details to show on the ticket
        fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/eventos-cientificos/${id}`)
            .then(res => res.json())
            .then(data => {
                setEvento(data.evento);
                setLoading(false);
            })
            .catch(() => setLoading(false));
            
        // Trigger confetti or similar effect if possible (simulate with simple timeout)
    }, [id]);

    const formatFecha = (fecha) => {
        if (!fecha) return "";
        const f = new Date(fecha);
        return isNaN(f.getTime()) ? fecha : f.toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatHora = (fecha) => {
        if (!fecha) return "";
        const f = new Date(fecha);
        return isNaN(f.getTime()) ? "" : f.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' });
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // El ID único para el QR basado en socio y evento
    const ticketId = `TKT-${evento?.id_evento || id}-${socio?.id || 'GUEST'}-${Math.floor(Math.random() * 10000)}`;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000"></div>
            
            <div className="text-center mb-10 z-10 animate-fade-in-down">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4 ring-4 ring-green-500/30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 font-sans tracking-tight">¡Pago completado!</h1>
                <p className="text-gray-300 text-lg">Tu inscripción ha sido confirmada. Aquí tienes tu entrada oficial.</p>
            </div>

            {/* HIGH FIDELITY TICKET COMPONENT */}
            <div className="z-10 w-full max-w-4xl mx-auto flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500 animate-fade-in-up filter drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)]">
                
                {/* Left Side (Main Body) */}
                <div className="bg-white flex-1 p-8 md:p-10 relative flex flex-col">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gray-900 rounded-bl-full md:hidden"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-gray-900 rounded-tl-full md:hidden"></div>

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Entrada VIP / Official Pass</p>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                                {evento?.nombre_evento || "Evento Científico"}
                            </h2>
                        </div>
                        <div className="hidden md:block w-16 h-16 opacity-20">
                            <svg className="w-full h-full text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 3.8l6.8 13.6H5.2L12 5.8z"/></svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8 mt-auto flex-grow">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Asistente</p>
                            <p className="text-lg font-bold text-gray-800">{socio?.nombre ? `${socio.nombre} ${socio.apellidos}` : "Invitado"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Fecha</p>
                            <p className="text-lg font-bold text-gray-800">{formatFecha(evento?.fecha_evento_inicio)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Hora de Inicio</p>
                            <p className="text-lg font-bold text-gray-800">{formatHora(evento?.fecha_evento_inicio)} h</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Booking Ref</p>
                            <p className="text-lg font-bold text-gray-800 tracking-wider font-mono">{ticketId.split('-')[1]}-{ticketId.split('-')[3]}</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-6 border-t-2 border-dashed border-gray-200">
                        <p className="text-xs text-gray-400 font-mono text-center overflow-hidden">
                            {Array(50).fill("||| | || |||").join(" ")}
                        </p>
                    </div>
                </div>

                {/* Vertical Dashed Line Divider (Visible on Desktop) */}
                <div className="hidden md:flex flex-col items-center bg-white w-8 relative">
                    <div className="absolute -top-4 w-8 h-8 rounded-full bg-gray-900"></div>
                    <div className="h-full w-0.5 border-l-2 border-dashed border-gray-300 my-4"></div>
                    <div className="absolute -bottom-4 w-8 h-8 rounded-full bg-gray-900"></div>
                </div>

                {/* Horizontal Dashed Line Divider (Visible on Mobile) */}
                <div className="md:hidden flex items-center bg-white h-8 relative w-full">
                    <div className="absolute -left-4 w-8 h-8 rounded-full bg-gray-900"></div>
                    <div className="w-full h-0.5 border-t-2 border-dashed border-gray-300 mx-4"></div>
                    <div className="absolute -right-4 w-8 h-8 rounded-full bg-gray-900"></div>
                </div>

                {/* Right Side (QR Code & Scan Area) */}
                <div className="bg-indigo-600 flex-none md:w-72 p-8 md:p-10 flex flex-col justify-center items-center text-white relative">
                    <div className="bg-white p-4 rounded-xl shadow-inner mb-6 transform rotate-[-2deg] hover:rotate-0 transition-transform">
                        <QRCodeSVG 
                            value={`https://scdi-app.com/verify/${ticketId}`}
                            size={160}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"Q"}
                            includeMargin={false}
                        />
                    </div>
                    <p className="text-sm font-medium tracking-wide uppercase mb-1">Muestra este código</p>
                    <p className="text-xs font-light opacity-75 text-center">en el control de acceso del evento.</p>
                    
                    <div className="absolute bottom-4 right-4 opacity-10 font-bold text-6xl italic transform -rotate-12">
                        SCDI
                    </div>
                </div>
            </div>

            <div className="mt-12 z-10 flex gap-4 animate-fade-in-up transition-all delay-500">
                <button
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-semibold transition backdrop-blur-sm flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    Imprimir o Guardar PDF
                </button>

                <button
                    onClick={() => navigate(`/eventos-cientificos/${id}`)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg rounded-full font-semibold transition flex items-center"
                >
                    Volver a Detalles
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </div>
            
            <style jsx="true">{`
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.8s ease-out; }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
                .animate-blob { animation: blob 10s infinite alternate; }
                .animation-delay-2000 { animation-delay: 2s; }
                
                @media print {
                    body { background: white !important; }
                    .animate-blob, button { display: none !important; }
                    .shadow-2xl { box-shadow: none !important; border: 1px solid #ccc; }
                }
            `}</style>
        </div>
    );
};

export default EventoExito;