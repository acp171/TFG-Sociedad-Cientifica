import { Link } from "react-router-dom";

const CallToAction = () => (
    <section className="pt-10 pb-10 px-6 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para unirte a la SCDI?</h2>
        <p className="mb-6 text-lg">Conéctate con una red vibrante de mentes científicas y tecnológicas.</p>
        <Link
            to="/unete"
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-full hover:bg-gray-200 hover:text-blue-800 transition"
        >
            Unirme Ahora
        </Link>
    </section>
);

export default CallToAction;
