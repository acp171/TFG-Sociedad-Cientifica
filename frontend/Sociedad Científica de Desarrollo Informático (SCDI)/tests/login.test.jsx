import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import Login from '../src/pages/Autenticacion/Login';
import { useAuth } from '../src/contexts/AuthContext';

// Mock de i18next para simplificar cadenas de traducción
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock del contexto de autenticación
vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Prueba de Integración: Login', () => {
  const mockLoginFn = vi.fn();
  const mockNavigateFn = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockLoginFn.mockClear();
    mockNavigateFn.mockClear();

    // Inyectar mock useAuth
    useAuth.mockReturnValue({
      login: mockLoginFn,
    });

    // Mock global de fetch de la API
    vi.stubGlobal('fetch', vi.fn());
  });

  test('Renderiza el formulario con campos e inputs requeridos', () => {
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Comprobar títulos y textos de traducción
    expect(screen.getByText('login.titulo')).toBeInTheDocument();
    expect(screen.getByText('login.email')).toBeInTheDocument();
    expect(screen.getByText('login.contrasena')).toBeInTheDocument();

    // Comprobar inputs por sus selectores específicos
    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');
    const submitButton = screen.getByRole('button', { name: 'login.boton' });

    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('required');
    expect(submitButton).toBeInTheDocument();
  });

  test('Inicio de sesión exitoso y redirección', async () => {
    const mockResponse = {
      token: 'jwt_mock_token_123',
      socio: { id_socio: 5, nombre: 'Juan', email: 'test@socio.com', fecha_expiracion: null },
    };

    // Configurar fetch mock exitoso
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');
    const submitButton = screen.getByRole('button', { name: 'login.boton' });

    // Simular escritura del usuario
    fireEvent.change(emailInput, { target: { value: 'test@socio.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Enviar el formulario
    fireEvent.click(submitButton);

    // Esperar a que se procese el fetch y se llame al login del contexto
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(mockLoginFn).toHaveBeenCalledWith(mockResponse.token, mockResponse.socio);
    });
  });

  test('Muestra un mensaje de error si las credenciales son inválidas', async () => {
    const mockErrorResponse = {
      message: 'Credenciales incorrectas.',
    };

    // Configurar fetch mock fallido (401 Unauthorized)
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => mockErrorResponse,
    });

    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');
    const submitButton = screen.getByRole('button', { name: 'login.boton' });

    fireEvent.change(emailInput, { target: { value: 'error@socio.com' } });
    fireEvent.change(passwordInput, { target: { value: 'errorpass' } });

    fireEvent.click(submitButton);

    // Esperar a que aparezca el mensaje de error en el DOM
    await waitFor(() => {
      expect(screen.getByText('Credenciales incorrectas.')).toBeInTheDocument();
    });
  });
});
