import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import Notificaciones from '../src/pages/Notificaciones';
import { useAuth } from '../src/contexts/AuthContext';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// framer-motion: mock ligero que pasa children directamente
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, className }) => (
      <div onClick={onClick} className={className}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('Prueba de Integración: Página de Notificaciones', () => {
  const mockNotificaciones = [
    {
      id_notificacion: 1,
      titulo: 'Nuevo evento disponible',
      mensaje: '<p>El congreso IA 2026 ya está disponible para inscripción.</p>',
      estado_lectura: false,
      fecha_envio: '2026-05-20T10:00:00Z',
    },
    {
      id_notificacion: 2,
      titulo: 'Tu artículo ha sido publicado',
      mensaje: '<p>Tu artículo sobre Quantum Computing ha sido aprobado.</p>',
      estado_lectura: true,
      fecha_envio: '2026-05-18T08:30:00Z',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem('token', 'jwt_mock_token');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('Muestra mensaje de inicio de sesión requerido si no está autenticado', () => {
    useAuth.mockReturnValue({ isLoggedIn: false });

    render(
      <MemoryRouter>
        <Notificaciones />
      </MemoryRouter>
    );

    expect(screen.getByText('notificaciones_page.debes_iniciar')).toBeInTheDocument();
    // No debe hacer llamadas a la API
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('Muestra "cargando" mientras se obtienen las notificaciones', () => {
    useAuth.mockReturnValue({ isLoggedIn: true });

    // Respuesta que nunca resuelve para ver el estado de carga
    global.fetch.mockReturnValueOnce(new Promise(() => {}));

    render(
      <MemoryRouter>
        <Notificaciones />
      </MemoryRouter>
    );

    expect(screen.getByText('notificaciones_page.cargando')).toBeInTheDocument();
  });

  test('Renderiza lista de notificaciones con sus títulos correctamente', async () => {
    useAuth.mockReturnValue({ isLoggedIn: true });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        notificaciones: { listadoNotificaciones: mockNotificaciones },
      }),
    });

    render(
      <MemoryRouter>
        <Notificaciones />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nuevo evento disponible')).toBeInTheDocument();
      expect(screen.getByText('Tu artículo ha sido publicado')).toBeInTheDocument();
    });
  });

  test('Muestra mensaje "sin notificaciones" cuando la lista está vacía', async () => {
    useAuth.mockReturnValue({ isLoggedIn: true });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        notificaciones: { listadoNotificaciones: [] },
      }),
    });

    render(
      <MemoryRouter>
        <Notificaciones />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('notificaciones_page.sin_notificaciones')).toBeInTheDocument();
    });
  });

  test('Al hacer clic en una notificación no leída abre el modal con su contenido', async () => {
    useAuth.mockReturnValue({ isLoggedIn: true });

    // Primera llamada: listado; segunda: PATCH marcar leída
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notificaciones: { listadoNotificaciones: mockNotificaciones },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(
      <MemoryRouter>
        <Notificaciones />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nuevo evento disponible')).toBeInTheDocument();
    });

    // Hacer clic en la primera notificación (no leída)
    fireEvent.click(screen.getByText('Nuevo evento disponible'));

    await waitFor(() => {
      // El modal debe mostrar el título de la notificación
      expect(screen.getAllByText('Nuevo evento disponible').length).toBeGreaterThan(1);
      // Y el botón de cerrar
      expect(screen.getByText('notificaciones_page.cerrar')).toBeInTheDocument();
    });
  });

  test('Al hacer clic en "Cerrar" del modal, el modal desaparece', async () => {
    useAuth.mockReturnValue({ isLoggedIn: true });

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notificaciones: { listadoNotificaciones: mockNotificaciones },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(
      <MemoryRouter>
        <Notificaciones />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nuevo evento disponible')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Nuevo evento disponible'));

    await waitFor(() => {
      expect(screen.getByText('notificaciones_page.cerrar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('notificaciones_page.cerrar'));

    await waitFor(() => {
      expect(screen.queryByText('notificaciones_page.cerrar')).not.toBeInTheDocument();
    });
  });
});
