import { useNavigate } from "react-router-dom";
import { FaGraduationCap, FaUserTie, FaGlobe, FaUsers, FaUser } from "react-icons/fa";

const planes = [
    {
        id_tipo_socio: 2,
        nombre_tipo: "Estudiante",
        cuota: 10,
        icon: <FaGraduationCap className="text-4xl text-blue-600" />,
        bg: "from-blue-100 to-blue-200",
        price_stripe: "price_1RaHU2PbMwKwBYLWo0AaCRmB",
    },
    {
        id_tipo_socio: 1,
        nombre_tipo: "Socio",
        cuota: 20,
        icon: <FaUser className="text-4xl text-indigo-600" />,
        bg: "from-indigo-100 to-indigo-200",
        price_stripe: "price_1RaGzAPbMwKwBYLWadUDiRZT",
    },
    {
        id_tipo_socio: 3,
        nombre_tipo: "Profesional",
        cuota: 50,
        icon: <FaUserTie className="text-4xl text-purple-600" />,
        bg: "from-purple-100 to-purple-200",
        price_stripe: "price_1RaaIcPbMwKwBYLW145DYXpp",
    },
    {
        id_tipo_socio: 5,
        nombre_tipo: "Internacional",
        cuota: 100,
        icon: <FaGlobe className="text-4xl text-green-600" />,
        bg: "from-green-100 to-green-200",
        price_stripe: "price_1RaHVqPbMwKwBYLWK7Uqmj3J",
    },
    {
        id_tipo_socio: 6,
        nombre_tipo: "Corporación",
        cuota: 500,
        icon: <FaUsers className="text-4xl text-yellow-600" />,
        bg: "from-yellow-100 to-yellow-200",
        price_stripe: "price_1RaHVDPbMwKwBYLWrXVYmm7F",
    },
];

const SeleccionarPlan = () => {
    const navigate = useNavigate();

    const seleccionarPlan = (plan) => {
        localStorage.setItem("planSeleccionado", JSON.stringify(plan));
        navigate("/register");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 py-16 px-4">
            <h1 className="text-5xl font-bold text-center text-indigo-800 mb-16">Elige tu plan de membresía</h1>

            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {planes.slice(0, 3).map((plan) => (
                    <CardPlan key={plan.id_tipo_socio} plan={plan} onSelect={seleccionarPlan} />
                ))}
            </div>

            <div className="max-w-7xl mx-auto mt-12 flex flex-col sm:flex-row justify-center gap-10">
                {planes.slice(3, 5).map((plan) => (
                    <div className="w-full sm:w-1/2 lg:w-1/3">
                        <CardPlan key={plan.id_tipo_socio} plan={plan} onSelect={seleccionarPlan} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const CardPlan = ({ plan, onSelect }) => (
    <div
        className={`bg-gradient-to-br ${plan.bg} rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-between hover:scale-105 transition-transform duration-300`}
    >
        <div className="flex flex-col items-center">
            {plan.icon}
            <h2 className="text-2xl font-bold mt-4 text-gray-800">{plan.nombre_tipo}</h2>
        </div>

        <div className="mt-8 text-center">
            <p className="text-3xl font-extrabold text-gray-900">
                {plan.cuota === 0 ? "Gratis" : `${plan.cuota} €/mes`}
            </p>
            <button
                onClick={() => onSelect(plan)}
                className="mt-6 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-200"
            >
                Seleccionar
            </button>
        </div>
    </div>
);

export default SeleccionarPlan;