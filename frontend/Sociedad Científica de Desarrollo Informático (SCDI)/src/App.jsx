import Header from './components/Header';
import Footer from './components/Footer';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QuienesSomos from './pages/Quienes-Somos';
import Unete from './pages/Unete';
import Login from './pages/Autenticacion/Login';
import Register from './pages/Autenticacion/Register';
import Articulos from './pages/Articulos/Articulos';
import ArticuloDetalle from './pages/Articulos/ArticuloDetalle';
import CrearArticulo from './pages/Articulos/CrearArticulo';
import Proyectos from './pages/Proyectos/Proyectos';
import ProyectoDetalle from './pages/Proyectos/ProyectoDetalle';
import CrearProyecto from './pages/Proyectos/CrearProyecto';
import Eventos from './pages/Eventos/Eventos';
import AvisoLegal from './pages/Aviso-Legal';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/unete" element={<Unete />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/articulos-cientificos" element={<Articulos />} />
          <Route path="/articulos-cientificos/:id" element={<ArticuloDetalle />} />
          <Route path="/articulos-cientificos/crear-articulo" element={<CrearArticulo />} />
          <Route path="/proyectos-investigacion" element={<Proyectos />} />
          <Route path="/proyectos-investigacion/:id" element={<ProyectoDetalle />} />
          <Route path="/proyectos-investigacion/crear-proyecto" element={<CrearProyecto />} />
          <Route path="/eventos-cientificos" element={<Eventos />} />
          <Route path="/politica-privacidad" element={<AvisoLegal />} />
        </Routes>
      </main>

      <Footer />
    </div>  
  );
}

export default App;