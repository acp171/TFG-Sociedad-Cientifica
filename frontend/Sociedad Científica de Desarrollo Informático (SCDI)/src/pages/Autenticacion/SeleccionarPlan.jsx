import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaGraduationCap, FaUserTie, FaGlobe, FaUsers, FaUser } from "react-icons/fa";
import API_BASE_URL from "../../config/backendConfig";

const baseDescripcion = (userTipoSocio) => (
    <>
        <p><strong>Perfil y gestión personal</strong></p>
        <ul className="list-disc pl-6 mb-3">
            <li>Pueden consultar su historial de pagos, inscripciones y publicaciones.</li>
            <li>Tienen acceso a su bandeja de notificaciones.</li>
            <li>Pueden cerrar sesión actual y gestionar sus credenciales.</li>
        </ul>

        <p><strong>Inscripción y participación</strong></p>
        <ul className="list-disc pl-6 mb-3">
            <li>Pueden inscribirse en eventos científicos organizados por la sociedad.</li>
            <li>Pueden cancelar su inscripción a eventos si aún están abiertos.</li>
        </ul>

        <p><strong>Publicaciones y comunidad científica</strong></p>
        <ul className="list-disc pl-6 mb-3">
            <li>Pueden publicar artículos científicos para su difusión dentro de la sociedad.</li>
            <li>Pueden comentar publicaciones de otros socios.</li>
        </ul>

        {userTipoSocio === 6 && (
            <>
                <p><strong>Gestión corporativa</strong></p>
                <ul className="list-disc pl-6 mb-3">
                    <li>Pueden añadir y gestionar miembros de su corporación.</li>
                </ul>
            </>
        )}

        {userTipoSocio === 1 && (
            <>
                <p><strong>Limitaciones</strong></p>
                <ul className="list-disc pl-6 mb-3">
                    <li>No pueden crear eventos científicos.</li>
                </ul>
            </>
        )}

        {userTipoSocio === 2 && (
            <>
                <p><strong>Limitaciones</strong></p>
                <ul className="list-disc pl-6 mb-3">
                    <li>No pueden crear ni proyectos ni eventos científicos.</li>
                </ul>
            </>
        )}
    </>
);

const PLAN_STYLES = {
    2: {
        icon: <FaGraduationCap className="text-4xl text-black-600" />,
        bg: "from-blue-300 to-blue-400",
        defaultNombre: "Estudiante / Junior",
        defaultDesc: "Menores de 18 años o emprendedores."
    },
    1: {
        icon: <FaUser className="text-4xl text-indigo-800" />,
        bg: "from-indigo-200 to-indigo-300",
        defaultNombre: "Socio / Titular",
        defaultDesc: ""
    },
    3: {
        icon: <FaUserTie className="text-4xl text-purple-600" />,
        bg: "from-purple-100 to-purple-200",
        defaultNombre: "Profesional",
        defaultDesc: ""
    },
    4: {
        icon: <FaUser className="text-4xl text-emerald-800" />,
        bg: "from-emerald-100 to-emerald-200",
        defaultNombre: "Honorario",
        defaultDesc: "Miembro de honor."
    },
    5: {
        icon: <FaGlobe className="text-4xl text-green-600" />,
        bg: "from-green-100 to-green-200",
        defaultNombre: "Internacional",
        defaultDesc: ""
    },
    6: {
        icon: <FaUsers className="text-4xl text-yellow-600" />,
        bg: "from-yellow-100 to-yellow-200",
        defaultNombre: "Corporación",
        defaultDesc: "Permite registrar y gestionar múltiples usuarios bajo una sola membresía."
    }
};

const DEFAULT_STYLE = {
    icon: <FaUser className="text-4xl text-gray-600" />,
    bg: "from-slate-200 to-slate-300",
    defaultNombre: "Socio Especial",
    defaultDesc: ""
};

const SeleccionarPlan = () => {
    const navigate = useNavigate();
    const [planes, setPlanes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPlanes = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/tipos-publico`);
                if (!res.ok) throw new Error("Error al cargar los planes");
                const data = await res.json();
                
                const listadoPlanes = (data.tipos || []).map(tipo => {
                    const styleInfo = PLAN_STYLES[tipo.id_tipo_socio] || DEFAULT_STYLE;
                    
                    return {
                        id_tipo_socio: tipo.id_tipo_socio,
                        nombre_tipo: tipo.nombre_tipo || styleInfo.defaultNombre,
                        cuota: tipo.cuota,
                        price_stripe: tipo.price_stripe,
                        icon: styleInfo.icon,
                        bg: styleInfo.bg,
                        descripcion: (
                            <>
                                {(tipo.descripcion || styleInfo.defaultDesc) && (
                                    <p className="mb-3 italic text-gray-600">
                                        {tipo.descripcion || styleInfo.defaultDesc}
                                    </p>
                                )}
                                {baseDescripcion(tipo.id_tipo_socio)}
                            </>
                        )
                    };
                });
                
                // Ordenar por cuota ascendente para que se vean organizados
                listadoPlanes.sort((a, b) => a.cuota - b.cuota);
                setPlanes(listadoPlanes);
            } catch (err) {
                console.error("Error al obtener planes:", err);
                setError("No se pudieron cargar los planes de membresía. Por favor, inténtelo de nuevo más tarde.");
            } finally {
                setCargando(false);
            }
        };
        
        fetchPlanes();
    }, []);

    const seleccionarPlan = (plan) => {
        localStorage.setItem("planSeleccionado", JSON.stringify(plan));
        navigate("/register");
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-100 flex flex-col items-center justify-center py-16 px-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-900 mb-4"></div>
                <p className="text-xl font-semibold text-blue-900 animate-pulse">Cargando planes de membresía...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-100 flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-md max-w-lg text-center">
                    <p className="text-lg text-red-700 font-bold mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-md"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-100 py-16 px-4">
            <div className="max-w-7xl mx-auto text-center mb-16">
                <h1 className="text-5xl font-extrabold text-blue-900 mb-4 tracking-tight">Elige tu plan de membresía</h1>
                <p className="text-lg text-blue-700 max-w-2xl mx-auto">Selecciona la modalidad que mejor se adapte a tu perfil y empieza a disfrutar de las ventajas de nuestra sociedad científica.</p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
                {planes.map((plan) => (
                    <div className="w-full max-w-sm" key={plan.id_tipo_socio}>
                        <CardPlan
                            plan={plan}
                            onSelect={seleccionarPlan}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
  
const CardPlan = ({ plan, onSelect }) => {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div
            className="relative rounded-3xl shadow-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 h-[440px] md:h-[450px] border border-white/40 ring-1 ring-black/5"
            onMouseEnter={() => setIsRevealed(true)}
            onMouseLeave={() => setIsRevealed(false)}
            onClick={() => setIsRevealed(true)}
        >
            {/* Vista Frontal */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br ${plan.bg} transition-opacity duration-500 ease-in-out ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="bg-white/40 p-5 rounded-full shadow-inner mb-6 backdrop-blur-sm">
                    {plan.icon}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">{plan.nombre_tipo}</h2>
                <div className="text-center">
                    <p className="text-5xl font-black text-gray-900 drop-shadow-sm flex items-end justify-center gap-1">
                        {plan.cuota === 0 ? "Gratis" : `${plan.cuota}€`}
                        {plan.cuota !== 0 && <span className="text-lg font-medium text-gray-700 mb-1">/mes</span>}
                    </p>
                </div>
                
                <div className="absolute bottom-8 text-blue-900 font-bold text-xs sm:text-sm tracking-widest flex flex-col items-center gap-2 opacity-70 animate-pulse text-center">
                    <span>TOCA PARA VER VENTAJAS</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {/* Vista Trasera (Overlay) */}
            <div className={`absolute inset-0 bg-white p-6 md:p-8 transform transition-transform duration-500 ease-in-out flex flex-col ${isRevealed ? 'translate-y-0' : 'translate-y-full'}`}>
                <h3 className="text-xl font-bold text-indigo-900 mb-3 text-center border-b-2 border-indigo-50 pb-2 flex-shrink-0">
                    Ventajas: {plan.nombre_tipo}
                </h3>
                
                {/* Scrollable content container */}
                <div className="flex-grow overflow-y-auto text-sm text-gray-700 pr-2 custom-scrollbar space-y-2 mb-4">
                    {plan.descripcion}
                </div>
                
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Evitar que el clic cierre el plan accidentalmente
                        onSelect(plan);
                    }}
                    className="mt-auto flex-shrink-0 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition"
                >
                    Seleccionar por {plan.cuota === 0 ? "0€" : `${plan.cuota}€`}
                </button>
            </div>
        </div>
    );
};

export default SeleccionarPlan;