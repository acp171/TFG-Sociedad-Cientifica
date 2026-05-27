import { useTranslation } from "react-i18next";

const AvisoLegal = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-6 text-justify text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-700" dangerouslySetInnerHTML={{ __html: t("aviso_legal.titulo") }} />

      <p className="mb-4" dangerouslySetInnerHTML={{ __html: t("aviso_legal.p1") }} />

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-600">{t("aviso_legal.seccion1_titulo")}</h2>
      <p className="mb-4" dangerouslySetInnerHTML={{ __html: t("aviso_legal.seccion1_p") }} />

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-600">{t("aviso_legal.seccion2_titulo")}</h2>
      <p className="mb-4">{t("aviso_legal.seccion2_p")}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-600">{t("aviso_legal.seccion3_titulo")}</h2>
      <p className="mb-4">{t("aviso_legal.seccion3_p")}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-600">{t("aviso_legal.seccion4_titulo")}</h2>
      <p className="mb-4">{t("aviso_legal.seccion4_p")}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-600">{t("aviso_legal.seccion5_titulo")}</h2>
      <p className="mb-4">{t("aviso_legal.seccion5_p")}</p>
    </div>
  );
};

export default AvisoLegal;