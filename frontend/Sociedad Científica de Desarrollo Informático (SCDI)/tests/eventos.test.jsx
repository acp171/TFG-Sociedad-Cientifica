import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import Eventos from '../src/pages/Eventos/Eventos';
import { useAuth } from '../src/contexts/AuthContext';

// Mock de i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));

// Mock del contexto de autenticación
vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock de FullCalendar para evitar problemas de renderizado de maquetación en jsdom
vi.mock('@fullcalendar/react', () => ({
  default: (props) => <div data-testid="full-calendar">FullCalendar Mocked</div>,
}));

describe('Prueba de Integración: Listado de Eventos Científicos', () => {
  const mockEventosArray = [
    { id_evento: 1, nombre_evento: 'Congreso IA 2026', descripcion_evento: 'Debates sobre LLMs', slug: 'congreso-ia-2026' },
    { id_evento: 2, nombre_evento: 'Simposio Web Avanzado', descripcion_evento: 'Vite y React 19', slug: 'simposio-web-avanzado' },
    { id_evento: 3, nombre_evento: 'Jornadas Ciberseguridad', descripcion_evento: 'Seguridad en la nube', slug: 'jornadas-ciberseguridad' },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    useAuth.mockReturnValue({
      userRole: 2,
      userTipoSocio: 2, // Socio estándar
    });

    // Mock de fetch global retornando los eventos
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ eventos: { listaEventos: mockEventosArray } }),
    }));
  });

  test('Muestra el estado de carga al principio y luego renderiza los eventos en tarjetas', async () => {
    render(
      <MemoryRouter>
        <Eventos />
      </MemoryRouter>
    );

    // Debe mostrar texto de cargando inicialmente
    expect(screen.getByText('eventos.cargando')).toBeInTheDocument();

    // Esperar a que desaparezca el cargando y se rendericen las tarjetas de eventos
    await waitFor(() => {
      expect(screen.queryByText('eventos.cargando')).not.toBeInTheDocument();
      expect(screen.getByText('Congreso IA 2026')).toBeInTheDocument();
      expect(screen.getByText('Simposio Web Avanzado')).toBeInTheDocument();
    });

    // Validar enlaces de redirección a detalles por el slug correcto
    const firstEventLink = screen.getByLabelText('Ver artículo: Congreso IA 2026');
    expect(firstEventLink).toBeInTheDocument();
    expect(firstEventLink).toHaveAttribute('href', '/eventos-cientificos/congreso-ia-2026');
  });

  test('Control de acceso al botón "Crear Evento" según tipo de socio y rol', async () => {
    // Caso A: Socio ordinario (userTipoSocio: 2) -> NO debe ver el botón crear
    useAuth.mockReturnValue({
      userRole: 2,
      userTipoSocio: 2,
    });

    const { rerender } = render(
      <MemoryRouter>
        <Eventos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('eventos.crear')).not.toBeInTheDocument();
    });

    // Caso B: Administrador (userRole: 1) -> SÍ debe ver el botón crear
    useAuth.mockReturnValue({
      userRole: 1,
      userTipoSocio: 2,
    });

    rerender(
      <MemoryRouter>
        <Eventos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('eventos.crear')).toBeInTheDocument();
      expect(screen.getByText('eventos.crear')).toHaveAttribute('href', '/eventos-cientificos/crear-evento-cientifico');
    });
  });

  test('Cambio de modo de vista entre Lista y Calendario', async () => {
    render(
      <MemoryRouter>
        <Eventos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Congreso IA 2026')).toBeInTheDocument();
    });

    // Botón de vista calendario
    const calendarBtn = screen.getByText('Calendario');
    fireEvent.click(calendarBtn);

    // Debe ocultar las tarjetas de lista y mostrar el componente del calendario mockeado
    expect(screen.queryByText('Congreso IA 2026')).not.toBeInTheDocument();
    expect(screen.getByTestId('full-calendar')).toBeInTheDocument();
  });

  test('Gestión de paginación con más de 6 eventos', async () => {
    // Generar 8 eventos para forzar la creación de dos páginas (6 por página)
    const mockPaginacionEventos = Array.from({ length: 8 }, (_, i) => ({
      id_evento: i + 1,
      nombre_evento: `Evento Paginado ${i + 1}`,
      descripcion_evento: `Descripción del evento ${i + 1}`,
      slug: `evento-paginado-${i + 1}`,
    }));

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ eventos: { listaEventos: mockPaginacionEventos } }),
    });

    render(
      <MemoryRouter>
        <Eventos />
      </MemoryRouter>
    );

    // Esperar a que se carguen
    await waitFor(() => {
      expect(screen.getByText('Evento Paginado 1')).toBeInTheDocument();
      // El evento 7 no debe mostrarse en la página 1 (límite de 6 por página)
      expect(screen.queryByText('Evento Paginado 7')).not.toBeInTheDocument();
    });

    // Debe haber botones de paginación: "1", "2"
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();

    // Hacemos click en la página 2
    const pageTwoBtn = screen.getByRole('button', { name: '2' });
    fireEvent.click(pageTwoBtn);

    // En la página 2, debe mostrarse el Evento 7 y 8, y ocultarse el Evento 1
    await waitFor(() => {
      expect(screen.getByText('Evento Paginado 7')).toBeInTheDocument();
      expect(screen.getByText('Evento Paginado 8')).toBeInTheDocument();
      expect(screen.queryByText('Evento Paginado 1')).not.toBeInTheDocument();
    });
  });
});
