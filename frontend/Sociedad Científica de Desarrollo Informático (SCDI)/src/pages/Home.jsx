import SCDISection from "../sections/SCDISection";
import SobreNosotros from "../sections/SobreNosotros";
import Areas from "../sections/Areas";
import ProyectosSection from "../sections/ProyectosSection";
import EventosSection from "../sections/EventosSection";
import CallToAction from "../sections/CallToAction";

const Home = () => {
    return (
        <main className="flex flex-col">
            <SCDISection />
            <SobreNosotros />
            <Areas />
            <ProyectosSection />
            <EventosSection />
            <CallToAction className="mb-0" />
        </main>
    );
};

export default Home;