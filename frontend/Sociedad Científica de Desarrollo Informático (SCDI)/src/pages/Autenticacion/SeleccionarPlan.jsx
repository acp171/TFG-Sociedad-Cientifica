import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaGraduationCap, FaUserTie, FaGlobe, FaUsers, FaUser } from "react-icons/fa";

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

const planes = [
    {
        id_tipo_socio: 2,
        nombre_tipo: "Estudiante / Junior",
        cuota: 10,
        icon: <FaGraduationCap className="text-4xl text-black-600" />,
        bg: "from-blue-300 to-blue-400",
        price_stripe: "price_1RaHU2PbMwKwBYLWo0AaCRmB",
        descripcion: (
            <>
                <p className="mb-2">
                    Menores de 18 años o emprendedores.
                </p>
                {baseDescripcion(2)}
            </>
          ),
    },
    {
        id_tipo_socio: 1,
        nombre_tipo: "Socio / Titular",
        cuota: 20,
        icon: <FaUser className="text-4xl text-indigo-800" />,
        bg: "from-indigo-200 to-indigo-300",
        price_stripe: "price_1RaGzAPbMwKwBYLWadUDiRZT",
        descripcion: baseDescripcion(1),
    },
    {
        id_tipo_socio: 3,
        nombre_tipo: "Profesional",
        cuota: 50,
        icon: <FaUserTie className="text-4xl text-purple-600" />,
        bg: "from-purple-100 to-purple-200",
        price_stripe: "price_1RaaIcPbMwKwBYLW145DYXpp",
        descripcion: baseDescripcion(3),
    },
    {
        id_tipo_socio: 5,
        nombre_tipo: "Internacional",
        cuota: 100,
        icon: <FaGlobe className="text-4xl text-green-600" />,
        bg: "from-green-100 to-green-200",
        price_stripe: "price_1RaHVqPbMwKwBYLWK7Uqmj3J",
        descripcion: baseDescripcion(5),
    },
    {
        id_tipo_socio: 6,
        nombre_tipo: "Corporación",
        cuota: 500,
        icon: <FaUsers className="text-4xl text-yellow-600" />,
        bg: "from-yellow-100 to-yellow-200",
        price_stripe: "price_1RaHVDPbMwKwBYLWrXVYmm7F",
        descripcion: (
            <>
                <p className="mb-2">
                    Permite registrar y gestionar múltiples usuarios bajo una sola membresía.
                </p>
                {baseDescripcion(6)}
            </>
        ),
    },
];

const SeleccionarPlan = () => {
    const navigate = useNavigate();

    const seleccionarPlan = (plan) => {
        localStorage.setItem("planSeleccionado", JSON.stringify(plan));
        navigate("/register");
    };

    return (
        <div className="min-h-[80vh] bg-gradient-to-b from-slate-50 to-blue-100 py-16 px-4">
            <div className="max-w-7xl mx-auto text-center mb-16">
                <h1 className="text-5xl font-extrabold text-blue-900 mb-4 tracking-tight">Elige tu plan de membresía</h1>
                <p className="text-lg text-blue-700 max-w-2xl mx-auto">Selecciona la modalidad que mejor se adapte a tu perfil y empieza a disfrutar de las ventajas de nuestra sociedad científica.</p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {planes.slice(0, 3).map((plan) => (
                    <CardPlan
                        key={plan.id_tipo_socio}
                        plan={plan}
                        onSelect={seleccionarPlan}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto mt-12 flex flex-col md:flex-row justify-center gap-10">
                {planes.slice(3, 5).map((plan) => (
                    <div className="w-full md:w-1/2 lg:w-1/3" key={plan.id_tipo_socio}>
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