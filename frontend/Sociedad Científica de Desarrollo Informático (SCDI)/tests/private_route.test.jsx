import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import PrivateRoute from '../src/components/Perfil/PrivateRoute';

describe('Prueba de Integración: PrivateRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('Redirecciona a la página de login si no hay token en localStorage', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <div data-testid="protected-content">Contenido Privado</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-content">Página de Iniciar Sesión</div>} />
        </Routes>
      </MemoryRouter>
    );

    // No debe renderizar el contenido protegido
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    // Debe haber redireccionado a la página de login
    expect(screen.getByTestId('login-content')).toBeInTheDocument();
    expect(screen.getByText('Página de Iniciar Sesión')).toBeInTheDocument();
  });

  test('Renderiza el componente hijo si hay un token en localStorage', () => {
    localStorage.setItem('token', 'jwt_test_token_987');

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <div data-testid="protected-content">Contenido Privado</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-content">Página de Iniciar Sesión</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Debe renderizar el contenido protegido
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Contenido Privado')).toBeInTheDocument();
    // No debe mostrar el login
    expect(screen.queryByTestId('login-content')).not.toBeInTheDocument();
  });
});
