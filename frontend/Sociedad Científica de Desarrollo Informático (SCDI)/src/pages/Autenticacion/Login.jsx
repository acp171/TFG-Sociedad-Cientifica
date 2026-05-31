import API_BASE_URL from '../../config/backendConfig';
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { t } = useTranslation();

    const cameFrom = location.state?.from;
    const redireccionFinal = cameFrom && cameFrom !== "/unete" ? cameFrom : "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Error al iniciar sesión");
            }

            login(data.token, data.socio);
            navigate(redireccionFinal, { replace: true });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-blue-200 to-white">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">{t("login.titulo")}</h2>

                <form onSubmit={handleSubmit}>
                    <label className="block mb-1 font-medium">{t("login.email")}</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label className="block mb-1 font-medium">{t("login.contrasena")}</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex flex-col items-center mb-6 space-y-2">
                        <Link
                            to="/register/seleccionar-plan"
                            title="Registrate"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                            {t("login.no_cuenta")}
                        </Link>

                        <Link
                            to="/recuperar-contrasena"
                            title="Recuperar contraseña"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                            {t("login.olvido")}
                        </Link>
                    </div>

                    {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 text-white font-semibold rounded-md transition-colors
                            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        {loading ? t("login.ingresando") : t("login.boton")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;