import { useNavigate } from "react-router-dom";

const Unete = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[83.7vh] flex">
      {/* Lado Izquierdo: Beneficios */}
      <div className="w-1/2 bg-indigo-600 text-white flex flex-col justify-center px-12 py-16">
        <h1 className="text-4xl font-extrabold mb-8">Únete a la plataforma</h1>
        <ul className="space-y-5 text-lg">
          <li>✔️ Colabora en proyectos de investigación</li>
          <li>✔️ Administra miembros y roles fácilmente</li>
          <li>✔️ Centraliza la información de tus investigaciones</li>
          <li>✔️ Plataforma segura y personalizada</li>
        </ul>
      </div>

      {/* Lado Derecho: Botones de acción */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-white px-10">
        <h2 className="text-3xl font-bold mb-10 text-gray-800">
          ¡Empieza ahora!
        </h2>

        <div className="flex flex-col gap-6 w-full max-w-sm">
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-indigo-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 transition cursor-pointer"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => navigate("/register")}
            className="w-full border border-indigo-600 text-indigo-600 py-3 rounded-md text-lg font-semibold hover:bg-indigo-50 transition cursor-pointer"
          >
            Crear Cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unete;