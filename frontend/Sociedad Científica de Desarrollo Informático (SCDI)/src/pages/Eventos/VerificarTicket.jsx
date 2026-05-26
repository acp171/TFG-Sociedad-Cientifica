import { useParams } from "react-router-dom";

const VerificarTicket = () => {
    const { ticketId } = useParams();

    // Parse the ticket ID: TKT-{eventoId}-{socioId}-{rand}
    const partes = ticketId?.split("-") || [];
    const esValido = partes.length === 4 && partes[0] === "TKT";
    const eventoId = partes[1];
    const socioId = partes[2];
    const ref = partes[3];

    if (!esValido) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-10 text-center max-w-md w-full shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-red-400 mb-3">Entrada no válida</h1>
                    <p className="text-gray-400">El código QR escaneado no corresponde a ninguna entrada reconocible.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-6 relative overflow-hidden">
            {/* Glow decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-green-600 rounded-full blur-[120px] opacity-30"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-emerald-600 rounded-full blur-[120px] opacity-30"></div>

            <div className="relative z-10 bg-gray-800/60 backdrop-blur-lg border border-green-500/30 rounded-2xl p-10 text-center max-w-md w-full shadow-2xl animate-fade-in">
                {/* Checkmark icon */}
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/40">
                    <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-4xl font-extrabold text-green-400 mb-2">¡Acceso Válido!</h1>
                <p className="text-gray-300 text-lg mb-8">Esta entrada ha sido verificada correctamente.</p>

                <div className="bg-gray-900/50 rounded-xl p-6 text-left space-y-4 border border-gray-700/50">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Evento ID</span>
                        <span className="text-white font-mono font-bold">#{eventoId}</span>
                    </div>
                    <div className="h-px bg-gray-700/50"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Socio ID</span>
                        <span className="text-white font-mono font-bold">#{socioId}</span>
                    </div>
                    <div className="h-px bg-gray-700/50"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Ref. Reserva</span>
                        <span className="text-white font-mono font-bold">{eventoId}-{ref}</span>
                    </div>
                </div>

                <div className="mt-8 inline-flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verificado · Sociedad Científica de Desarrollo Informático
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    0% { opacity: 0; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.6s ease-out; }
            `}</style>
        </div>
    );
};

export default VerificarTicket;
