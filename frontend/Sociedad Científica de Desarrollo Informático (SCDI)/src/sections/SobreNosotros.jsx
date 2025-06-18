import { Link } from "react-router-dom";

const SobreNosotros = () => {
    return (
        <section className="bg-white py-12">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">¿Quiénes Somos?</h2>
                <p className="text-gray-600 text-lg">
                    Somos una comunidad científica universitaria que impulsa la investigación, el desarrollo informático y la colaboración académica. A través de nuestra plataforma, conectamos talento joven con oportunidades de crecimiento científico y tecnológico.
                </p>
                <div className="mt-6">
                    <Link
                        to="/quienes-somos"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow"
                    >
                        Saber más
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default SobreNosotros;