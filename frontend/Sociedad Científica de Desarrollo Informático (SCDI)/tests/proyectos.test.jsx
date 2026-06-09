import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import Proyectos from '../src/pages/Proyectos/Proyectos';
import { useAuth } from '../src/contexts/AuthContext';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback || key }),
}));

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Prueba de Integración: Listado de Proyectos de Investigación', () => {
  const mockProyectos = [
    {
      id_proyecto: 1,
      nombre_proyecto: 'Proyecto Alpha IA',
      descripcion: 'Investigación sobre modelos de lenguaje',
      estado: 'Activo',
      fecha_inicio: '2025-01-01',
      fecha_fin: '2026-12-31',
      slug: 'proyecto-alpha-ia',
    },
    {
      id_proyecto: 2,
      nombre_proyecto: 'Proyecto Beta Seguridad',
      descripcion: 'Ciberseguridad en infraestructuras críticas',
      estado: 'Pausado',
      fecha_inicio: '2025-06-01',
      fecha_fin: '2027-06-01',
      slug: 'proyecto-beta-seguridad',
    },
    {
      id_proyecto: 3,
      nombre_proyecto: 'Proyecto Gamma Cloud',
      descripcion: 'Optimización de recursos en la nube',
      estado: 'Finalizado',
      fecha_inicio: '2023-01-01',
      fecha_fin: '2024-12-31',
      slug: 'proyecto-gamma-cloud',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    useAuth.mockReturnValue({ userRole: 2, userTipoSocio: 2 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ proyectos: { listaProyectos: mockProyectos } }),
    }));
  });

  test('Muestra cargando y luego renderiza proyectos correctamente', async () => {
    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    );

    expect(screen.getByText('proyectos.cargando')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('proyectos.cargando')).not.toBeInTheDocument();
      expect(screen.getByText('Proyecto Alpha IA')).toBeInTheDocument();
      expect(screen.getByText('Proyecto Beta Seguridad')).toBeInTheDocument();
      expect(screen.getByText('Proyecto Gamma Cloud')).toBeInTheDocument();
    });

    // Verificar enlace con slug
    const primerProyecto = screen.getByLabelText('Ver proyecto: Proyecto Alpha IA');
    expect(primerProyecto).toHaveAttribute('href', '/proyectos-investigacion/proyecto-alpha-ia');
  });

  test('Botón "Nuevo proyecto" solo visible para usuarios con acceso (userTipoSocio > 2 o admin)', async () => {
    // Caso A: Socio estándar (tipoSocio 2) → NO ve el botón
    useAuth.mockReturnValue({ userRole: 2, userTipoSocio: 2 });
    const { rerender } = render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('proyectos.nuevo')).not.toBeInTheDocument();
    });

    // Caso B: Investigador senior (tipoSocio 3) → SÍ ve el botón
    useAuth.mockReturnValue({ userRole: 2, userTipoSocio: 3 });
    rerender(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('proyectos.nuevo')).toBeInTheDocument();
    });
  });

  test('Filtro por estado: al seleccionar "Activo" solo muestra proyectos con ese estado', async () => {
    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Proyecto Alpha IA')).toBeInTheDocument();
    });

    // Seleccionar filtro "Activo"
    const filtroEstado = screen.getByDisplayValue('proyectos.todos_estados');
    fireEvent.change(filtroEstado, { target: { value: 'activo' } });

    await waitFor(() => {
      expect(screen.getByText('Proyecto Alpha IA')).toBeInTheDocument();
      // Los otros estados deben ocultarse
      expect(screen.queryByText('Proyecto Beta Seguridad')).not.toBeInTheDocument();
      expect(screen.queryByText('Proyecto Gamma Cloud')).not.toBeInTheDocument();
    });
  });

  test('Filtro sin resultados muestra mensaje "proyectos.no_proyectos"', async () => {
    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Proyecto Alpha IA')).toBeInTheDocument();
    });

    // Filtrar por fecha muy futura (sin resultados, ya que la lógica es fecha_fin >= filtro)
    const filtroFecha = screen.getByDisplayValue('');
    fireEvent.change(filtroFecha, { target: { value: '2099-01-01' } });

    await waitFor(() => {
      expect(screen.getByText('proyectos.no_proyectos')).toBeInTheDocument();
    });
  });
});
