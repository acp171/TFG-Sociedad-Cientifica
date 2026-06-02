import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import Register from '../src/pages/Autenticacion/Register';

// Mock de PasarelaPago
vi.mock('../src/components/Pago/PasarelaPago', () => ({
  default: ({ onSuccess }) => (
    <button data-testid="mock-pago-btn" onClick={onSuccess}>
      Simular Pago Exitoso
    </button>
  ),
}));

describe('Prueba de Integración: Registro de Socios', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('Redirecciona a /seleccionar-plan si no hay ningún plan en localStorage', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/seleccionar-plan" element={<div data-testid="select-plan-page">Página Selección Plan</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Debe haber redireccionado automáticamente
    await waitFor(() => {
      expect(screen.getByTestId('select-plan-page')).toBeInTheDocument();
    });
  });

  test('Muestra el plan seleccionado y los campos del formulario si existe plan en localStorage', () => {
    const mockPlan = {
      id_tipo_socio: 2,
      nombre_tipo: 'Socio Estudiante',
      cuota: 5,
    };
    localStorage.setItem('planSeleccionado', JSON.stringify(mockPlan));

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Plan seleccionado:/)).toBeInTheDocument();
    expect(screen.getByText('Socio Estudiante')).toBeInTheDocument();
    expect(screen.getByText(/5 €\/mes/)).toBeInTheDocument();

    // Inputs básicos de registro
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apellidos')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Teléfono')).toBeInTheDocument();

    // Como id_tipo_socio es 2 (Socio Estudiante), debe mostrar el campo Universidad
    expect(screen.getByText('Universidad')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Universidad')).toBeInTheDocument();
  });

  test('Envío del formulario exitoso abre pasarela y redirige al éxito tras pagar', async () => {
    const mockPlan = {
      id_tipo_socio: 2,
      nombre_tipo: 'Socio Estudiante',
      cuota: 5,
    };
    localStorage.setItem('planSeleccionado', JSON.stringify(mockPlan));

    // Configurar llamada a registro que devuelve clientSecret
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: 'pi_stripe_secret_key_123' }),
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/registro-exitoso" element={<div data-testid="success-page">Registro Exitoso</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Rellenar formulario
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByPlaceholderText('Apellidos'), { target: { value: 'Mendoza' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'carlos@mail.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'secr3tpass' } });
    fireEvent.change(screen.getByPlaceholderText('Teléfono'), { target: { value: '600123456' } });
    fireEvent.change(container.querySelector('input[name="fecha_nacimiento"]'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByPlaceholderText('Universidad'), { target: { value: 'Universidad Complutense' } });

    // Enviar formulario
    const submitBtn = screen.getByRole('button', { name: 'Registrarse' });
    fireEvent.click(submitBtn);

    // Debe mostrar la pasarela de pago mockeada tras la respuesta del servidor
    await waitFor(() => {
      expect(screen.getByTestId('mock-pago-btn')).toBeInTheDocument();
    });

    // Hacer click en el botón de pago exitoso de la pasarela
    fireEvent.click(screen.getByTestId('mock-pago-btn'));

    // Debe borrar el plan seleccionado y navegar a registro-exitoso
    await waitFor(() => {
      expect(localStorage.getItem('planSeleccionado')).toBeNull();
      expect(screen.getByTestId('success-page')).toBeInTheDocument();
    });
  });

  test('Envío del formulario con error del servidor muestra mensaje de error', async () => {
    const mockPlan = {
      id_tipo_socio: 2,
      nombre_tipo: 'Socio Estudiante',
      cuota: 5,
    };
    localStorage.setItem('planSeleccionado', JSON.stringify(mockPlan));

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'El correo electrónico ya está registrado.' }),
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByPlaceholderText('Apellidos'), { target: { value: 'Mendoza' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'carlos@mail.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'secr3tpass' } });
    fireEvent.change(screen.getByPlaceholderText('Teléfono'), { target: { value: '600123456' } });
    fireEvent.change(container.querySelector('input[name="fecha_nacimiento"]'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByPlaceholderText('Universidad'), { target: { value: 'Universidad Complutense' } });

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    await waitFor(() => {
      expect(screen.getByText('El correo electrónico ya está registrado.')).toBeInTheDocument();
    });
  });
});
