import Header from './components/Header';
import Footer from './components/Footer';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QuienesSomos from './pages/Quienes-Somos';
import Articulos from './pages/Articulos';
import ArticuloDetalle from './pages/ArticuloDetalle';
import CrearArticulo from './pages/CrearArticulo';


function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/articulos-cientificos" element={<Articulos />} />
          <Route path="/articulos-cientificos/:id" element={<ArticuloDetalle />} />
          <Route path="/articulos-cientificos/crear-articulo" element={<CrearArticulo />} />
        </Routes>
      </main>

      <Footer />
    </div>  
  );
}

export default App;