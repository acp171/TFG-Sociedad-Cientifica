import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import Header from '../src/components/Layout/Header';
import { useAuth } from '../src/contexts/AuthContext';

// Mock de i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'es',
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock del contexto de autenticación
vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Prueba de Integración: Navegación Dinámica según Roles', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock fetch global vacío por las notificaciones sin leer que llama Header
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ notificaciones: { listadoNotificaciones: [] } }),
    }));
  });

  test('Renderiza elementos y enlaces públicos por defecto', () => {
    // Caso: Usuario invitado (no autenticado)
    useAuth.mockReturnValue({
      isLoggedIn: false,
      logout: vi.fn(),
      userRole: null,
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Enlaces de navegación básicos
    expect(screen.getAllByText('header.quienes_somos')[0]).toBeInTheDocument();
    expect(screen.getAllByText('header.actividades')[0]).toBeInTheDocument();
    expect(screen.getAllByText('header.proyectos')[0]).toBeInTheDocument();
    expect(screen.getAllByText('header.articulos')[0]).toBeInTheDocument();

    // Debe mostrar la opción de iniciar sesión/registrarse
    const loginLink = screen.getByTitle('header.iniciar_sesion');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/unete');

    // No debe mostrar elementos de usuario autenticado
    expect(screen.queryByTitle('header.mi_perfil')).not.toBeInTheDocument();
    expect(screen.queryByTitle('header.panel_admin')).not.toBeInTheDocument();
    expect(screen.queryByTitle('header.cerrar_sesion')).not.toBeInTheDocument();
  });

  test('Renderiza opciones de Socio pero no el panel de administración', async () => {
    // Caso: Socio autenticado normal (rol diferente a 1)
    useAuth.mockReturnValue({
      isLoggedIn: true,
      logout: vi.fn(),
      userRole: 2, // 2 = Socio
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Esperar a que se completen las actualizaciones asíncronas de estado (notificaciones)
    await waitFor(() => {
      // Debe mostrar perfil e inbox de notificaciones
      expect(screen.getByTitle('header.mi_perfil')).toBeInTheDocument();
      expect(screen.getByTitle('header.cerrar_sesion')).toBeInTheDocument();
    });

    // No debe mostrar acceso al panel de administración
    expect(screen.queryByTitle('header.panel_admin')).not.toBeInTheDocument();
    expect(screen.queryByTitle('header.iniciar_sesion')).not.toBeInTheDocument();
  });

  test('Renderiza opciones de Administrador incluyendo el panel de control', async () => {
    // Caso: Administrador autenticado (rol = 1)
    useAuth.mockReturnValue({
      isLoggedIn: true,
      logout: vi.fn(),
      userRole: 1, // 1 = Administrador
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Esperar a que se completen las actualizaciones asíncronas de estado
    await waitFor(() => {
      // Debe mostrar perfil, botón de salir y el panel de administración
      expect(screen.getByTitle('header.mi_perfil')).toBeInTheDocument();
      expect(screen.getByTitle('header.cerrar_sesion')).toBeInTheDocument();
      expect(screen.getByTitle('header.panel_admin')).toBeInTheDocument();
    });

    expect(screen.getByTitle('header.panel_admin')).toHaveAttribute('href', '/panel-administrador');
  });
});
