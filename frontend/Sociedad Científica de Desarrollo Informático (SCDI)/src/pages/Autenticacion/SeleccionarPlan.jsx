import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaGraduationCap, FaUserTie, FaGlobe, FaUsers, FaUser } from "react-icons/fa";

const baseDescripcion = (
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
            <li>Pueden acceder a un repositorio de artículos y materiales compartidos.</li>
        </ul>
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
                {baseDescripcion}
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
        descripcion: baseDescripcion,
    },
    {
        id_tipo_socio: 3,
        nombre_tipo: "Profesional",
        cuota: 50,
        icon: <FaUserTie className="text-4xl text-purple-600" />,
        bg: "from-purple-100 to-purple-200",
        price_stripe: "price_1RaaIcPbMwKwBYLW145DYXpp",
        descripcion: baseDescripcion,
    },
    {
        id_tipo_socio: 5,
        nombre_tipo: "Internacional",
        cuota: 100,
        icon: <FaGlobe className="text-4xl text-green-600" />,
        bg: "from-green-100 to-green-200",
        price_stripe: "price_1RaHVqPbMwKwBYLWK7Uqmj3J",
        descripcion: baseDescripcion,
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
                {baseDescripcion}
            </>
        ),
    },
];

const SeleccionarPlan = () => {
    const navigate = useNavigate();
    const [hoveredPlan, setHoveredPlan] = useState(null);
    const [isPanelVisible, setPanelVisible] = useState(false);

    const seleccionarPlan = (plan) => {
        localStorage.setItem("planSeleccionado", JSON.stringify(plan));
        navigate("/register");
    };

    const handleHover = (plan) => {
        setHoveredPlan(plan);
        setPanelVisible(true);
    };

    const handleLeave = () => {
        setPanelVisible(false);
        setTimeout(() => setHoveredPlan(null), 200); // coincide con slide-out
    };

    return (
        <div className="min-h-[80vh] bg-gradient-to-b from-blue-200 to-white py-16 px-4">
            <h1 className="text-5xl font-bold text-center text-indigo-800 mb-16">Elige tu plan de membresía</h1>

            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {planes.slice(0, 3).map((plan) => (
                    <CardPlan
                        key={plan.id_tipo_socio}
                        plan={plan}
                        onSelect={seleccionarPlan}
                        onHover={handleHover}
                        onLeave={handleLeave}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto mt-12 flex flex-col sm:flex-row justify-center gap-10">
                {planes.slice(3, 5).map((plan) => (
                    <div className="w-full sm:w-1/2 lg:w-1/3" key={plan.id_tipo_socio}>
                        <CardPlan
                            plan={plan}
                            onSelect={seleccionarPlan}
                            onHover={handleHover}
                            onLeave={handleLeave}
                        />
                    </div>
                ))}
            </div>

            {hoveredPlan && (
                <div
                    className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl p-6 z-50 border-r-4 border-indigo-600 transform ${
                        isPanelVisible ? "slide-in-left" : "slide-out-left"
                    }`}
                >
                    <h2 className="text-2xl font-bold text-indigo-800 mb-4">{hoveredPlan.nombre_tipo}</h2>
                    <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                        {hoveredPlan.descripcion}
                    </div>
                    <p className="text-lg font-semibold">
                        Cuota: {hoveredPlan.cuota === 0 ? "Gratis" : `${hoveredPlan.cuota} €/mes`}
                    </p>
                </div>
            )}
        </div>
    );
};
  
const CardPlan = ({ plan, onSelect, onHover, onLeave }) => (
    <div
        className={`bg-gradient-to-br ${plan.bg} rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-between hover:scale-105 transition-transform duration-300 cursor-pointer`}
        onClick={() => onSelect(plan)}
        onMouseEnter={() => onHover(plan)}
        onMouseLeave={onLeave}
    >
        <div className="flex flex-col items-center">
            {plan.icon}
            <h2 className="text-2xl font-bold mt-4 text-gray-800">{plan.nombre_tipo}</h2>
        </div>

        <div className="mt-8 text-center">
            <p className="text-3xl font-extrabold text-gray-900">
                {plan.cuota === 0 ? "Gratis" : `${plan.cuota} €/mes`}
            </p>
        </div>
    </div>
);

export default SeleccionarPlan;