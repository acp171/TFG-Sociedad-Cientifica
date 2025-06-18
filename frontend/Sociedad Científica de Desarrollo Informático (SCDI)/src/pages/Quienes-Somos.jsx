const QuienesSomos = () => {
    return (
        <section className="bg-white">
            {/* Imagen de portada */}
            <div className="w-full">
                <img
                    src="/quienes-somos.webp"
                    alt="Portada Sociedad Científica Quienes Somos"
                    className="w-full"
                    style={{ height: '550px' }}
                />
            </div>
            <div className="py-16 px-6 max-w-5xl mx-auto text-gray-800 space-y-8">
                <h1 className="text-4xl font-bold text-center mb-8">Quiénes somos</h1>
            
                <p>
                    La <strong>Sociedad Científica de Desarrollo Informático (SCDI)</strong> es una organización académica y colaborativa compuesta por estudiantes, docentes y profesionales interesados en el avance de la tecnología, la ciencia y la innovación dentro del ámbito universitario. Nuestro propósito es crear un ecosistema donde el conocimiento, la investigación y el desarrollo informático se conviertan en ejes fundamentales para impulsar el talento joven y contribuir activamente a la transformación digital en la educación superior.
                </p>
            
                <p>
                    A través de nuestra plataforma tecnológica, brindamos a nuestros socios un entorno integral para la participación activa en <strong>eventos científicos</strong>, <strong>proyectos de investigación</strong>, <strong>publicación de artículos</strong> y más. Nuestro sistema facilita la gestión de miembros, la inscripción a actividades, el seguimiento de pagos, la administración de comités y la comunicación fluida mediante notificaciones automatizadas.
                </p>
            
                <p>
                    En la SCDI valoramos la diversidad académica, por lo que contemplamos distintos tipos de membresía —desde estudiantes hasta miembros honorarios— cada uno con acceso a herramientas y contenidos adaptados a su perfil. También disponemos de una <strong>sección pública</strong>, orientada a visitantes externos, donde compartimos eventos destacados, publicaciones relevantes y avances de nuestros proyectos, fomentando así la divulgación científica.
                </p>
            
                <p>
                    Nuestra misión es <strong>conectar a las mentes inquietas y proactivas de la comunidad universitaria</strong>, promoviendo el trabajo colaborativo, la formación continua y la producción científica como pilares de nuestra identidad. Al unirnos, no solo compartimos conocimientos, sino que construimos una red sólida de apoyo y crecimiento profesional dentro de un marco ético, inclusivo y tecnológicamente avanzado.
                </p>
            </div>
        </section>
    );
};
  
export default QuienesSomos;