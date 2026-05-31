import BloqueoSuscripcion from './components/Suscripcion/BloqueoSuscripcion';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QuienesSomos from './pages/Quienes-Somos';
import Unete from './pages/Unete';
import Login from './pages/Autenticacion/Login';
import Register from './pages/Autenticacion/Register';
import SeleccionarPlan from './pages/Autenticacion/SeleccionarPlan';
import RegistroExitoso from './pages/Autenticacion/RegistroExitoso';
import Articulos from './pages/Articulos/Articulos';
import ArticuloDetalles from './pages/Articulos/ArticuloDetalles';
import CrearArticulo from './pages/Articulos/CrearArticulo';
import Proyectos from './pages/Proyectos/Proyectos';
import ProyectoDetalles from './pages/Proyectos/ProyectoDetalles';
import CrearProyecto from './pages/Proyectos/CrearProyecto';
import Eventos from './pages/Eventos/Eventos';
import EventoDetalles from './pages/Eventos/EventoDetalles';
import CrearEvento from './pages/Eventos/CrearEvento';
import EventoExito from './pages/Eventos/EventoExito';
import VerificarTicket from './pages/Eventos/VerificarTicket';
import AvisoLegal from './pages/Aviso-Legal';
import PanelAdmin from './pages/Administrador/PanelAdmin';
import Contacto from './pages/Contacto';
import Notificaciones from './pages/Notificaciones';
import ForgotPassword from './pages/Autenticacion/ForgotPassword';
import ResetPassword from './pages/Autenticacion/ResetPassword';
import PanelPerfil from './pages/Autenticacion/PanelPerfil';
import PrivateRoute from './components/Perfil/PrivateRoute';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <BloqueoSuscripcion />
      <Header />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/unete" element={<Unete />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
          <Route path="/restablecer-contrasena" element={<ResetPassword />} />
          <Route path="/register/seleccionar-plan" element={<SeleccionarPlan />} />
          <Route path="/registro-exitoso" element={<RegistroExitoso />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/articulos-cientificos" element={<Articulos />} />
          <Route path="/articulos-cientificos/:slug" element={<ArticuloDetalles />} />
          <Route path="/articulos-cientificos/crear-articulo" element={<CrearArticulo />} />
          <Route path="/proyectos-investigacion" element={<Proyectos />} />
          <Route path="/proyectos-investigacion/:slug" element={<ProyectoDetalles />} />
          <Route path="/proyectos-investigacion/crear-proyecto" element={<CrearProyecto />} />
          <Route path="/eventos-cientificos" element={<Eventos />} />
          <Route path="/eventos-cientificos/:slug" element={<EventoDetalles />} />
          <Route path="/eventos-cientificos/crear-evento-cientifico" element={<CrearEvento />} />
          <Route path="/eventos-cientificos/:slug/inscribirse/evento-exito" element={<EventoExito />} />
          <Route path="/verificar/:ticketId" element={<VerificarTicket />} />
          <Route path="/politica-privacidad" element={<AvisoLegal />} />
          <Route path="/panel-administrador" element={<PanelAdmin />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/notificaciones" element={<PrivateRoute><Notificaciones /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><PanelPerfil /></PrivateRoute>} />
        </Routes>
      </main>

      <Footer />
    </div>  
  );
}

export default App;