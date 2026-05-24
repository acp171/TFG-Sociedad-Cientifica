import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Unete = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-blue-100 to-white px-4">
          <div className="bg-white shadow-xl rounded-2xl p-10 max-w-sm w-full text-center">
            <h1 className="text-3xl font-bold text-blue-800 mb-8">{t("unete.titulo")}</h1>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-indigo-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 transition cursor-pointer"
              >
                {t("unete.iniciar_sesion")}
              </button>
              <button
                onClick={() => navigate("/register/seleccionar-plan")}
                className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-3 rounded-md text-lg font-semibold hover:bg-indigo-50 transition cursor-pointer"
              >
                {t("unete.crear_cuenta")}
              </button>
            </div>
          </div>
        </div>
    );
};

export default Unete;