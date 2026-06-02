import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import Articulos from '../src/pages/Articulos/Articulos';

// Mock de backendConfig
vi.mock('../src/config/backendConfig', () => ({ default: 'http://localhost:4000' }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback || key }),
}));

describe('Prueba de Integración: Listado de Artículos Científicos', () => {
  const mockArticulos = [
    { id_publicacion: 1, titulo: 'Redes Neuronales en 2026', contenido: 'Contenido sobre RN', nombre: 'Ana', apellidos: 'García', slug: 'redes-neuronales-2026' },
    { id_publicacion: 2, titulo: 'Quantum Computing Avanzado', contenido: 'Computación cuántica práctica', nombre: 'Luis', apellidos: 'Martínez', slug: 'quantum-computing-avanzado' },
    { id_publicacion: 3, titulo: 'Web3 y Blockchain', contenido: 'El futuro descentralizado', nombre: 'María', apellidos: 'López', slug: 'web3-blockchain' },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ articulos: { listadoArticulos: mockArticulos } }),
    }));
  });

  test('Muestra cargando y luego renderiza tarjetas de artículos correctamente', async () => {
    render(
      <MemoryRouter>
        <Articulos />
      </MemoryRouter>
    );

    expect(screen.getByText('articulos.cargando')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('articulos.cargando')).not.toBeInTheDocument();
      expect(screen.getByText('Redes Neuronales en 2026')).toBeInTheDocument();
      expect(screen.getByText('Quantum Computing Avanzado')).toBeInTheDocument();
      expect(screen.getByText('Web3 y Blockchain')).toBeInTheDocument();
    });

    // Verificar enlace con slug
    const primerArticulo = screen.getByLabelText('Ver artículo: Redes Neuronales en 2026');
    expect(primerArticulo).toHaveAttribute('href', '/articulos-cientificos/redes-neuronales-2026');
  });

  test('Muestra mensaje vacío si no hay artículos', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articulos: { listadoArticulos: [] } }),
    });

    render(
      <MemoryRouter>
        <Articulos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('articulos.no_articulos')).toBeInTheDocument();
    });
  });

  test('Siempre muestra el botón "Publicar artículo" independientemente del rol', async () => {
    render(
      <MemoryRouter>
        <Articulos />
      </MemoryRouter>
    );

    // El botón publicar no depende del rol en esta página
    expect(screen.getByText('articulos.publicar')).toBeInTheDocument();
    expect(screen.getByText('articulos.publicar').closest('a')).toHaveAttribute('href', '/articulos-cientificos/crear-articulo');
  });

  test('Paginación: muestra página 1 correctamente con más de 6 artículos y navega a página 2', async () => {
    const mockMuchosArticulos = Array.from({ length: 9 }, (_, i) => ({
      id_publicacion: i + 1,
      titulo: `Artículo de investigación ${i + 1}`,
      contenido: `Contenido ${i + 1}`,
      nombre: 'Autor',
      apellidos: 'Prueba',
      slug: `articulo-${i + 1}`,
    }));

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articulos: { listadoArticulos: mockMuchosArticulos } }),
    });

    render(
      <MemoryRouter>
        <Articulos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Artículo de investigación 1')).toBeInTheDocument();
      expect(screen.queryByText('Artículo de investigación 7')).not.toBeInTheDocument();
    });

    // Navegar a página 2
    fireEvent.click(screen.getByRole('button', { name: '2' }));

    await waitFor(() => {
      expect(screen.getByText('Artículo de investigación 7')).toBeInTheDocument();
      expect(screen.queryByText('Artículo de investigación 1')).not.toBeInTheDocument();
    });
  });
});
