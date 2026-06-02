import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import Contacto from '../src/pages/Contacto';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

// framer-motion puede causar problemas en jsdom; mockeamos el componente motion.div
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('Prueba de Integración: Formulario de Contacto', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('alert', vi.fn());
    localStorage.clear();
  });

  test('Renderiza el formulario con todos los campos requeridos', () => {
    render(
      <MemoryRouter>
        <Contacto />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('contacto.email')).toBeInTheDocument();
    expect(screen.getByLabelText('contacto.titulo_msg')).toBeInTheDocument();
    expect(screen.getByLabelText('contacto.mensaje')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'contacto.enviar' })).toBeInTheDocument();
  });

  test('Muestra alerta si se intenta enviar sin estar autenticado', async () => {
    // Sin token en localStorage
    render(
      <MemoryRouter>
        <Contacto />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText('contacto.email');
    const tituloInput = screen.getByLabelText('contacto.titulo_msg');
    const mensajeTextarea = screen.getByLabelText('contacto.mensaje');

    fireEvent.change(emailInput, { target: { value: 'test@test.com', name: 'email' } });
    fireEvent.change(tituloInput, { target: { value: 'Test Título', name: 'titulo' } });
    fireEvent.change(mensajeTextarea, { target: { value: 'Este es un mensaje de prueba', name: 'mensaje' } });

    fireEvent.click(screen.getByRole('button', { name: 'contacto.enviar' }));

    // Debe mostrar un alert de autenticación requerida
    expect(global.alert).toHaveBeenCalledWith('contacto.auth_requerida');
    // NO debe llamar a fetch porque falló la validación antes
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('Envío exitoso con usuario autenticado muestra mensaje de confirmación', async () => {
    // Simular token válido en localStorage
    localStorage.setItem('token', 'jwt_mock_token');

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Mensaje enviado correctamente.' }),
    });

    render(
      <MemoryRouter>
        <Contacto />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('contacto.email'), {
      target: { value: 'usuario@scdi.es', name: 'email' },
    });
    fireEvent.change(screen.getByLabelText('contacto.titulo_msg'), {
      target: { value: 'Consulta sobre eventos', name: 'titulo' },
    });
    fireEvent.change(screen.getByLabelText('contacto.mensaje'), {
      target: { value: 'Me gustaría información sobre los próximos eventos.', name: 'mensaje' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'contacto.enviar' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      // Tras el éxito, debe aparecer el mensaje de confirmación
      expect(screen.getByText('contacto.exito')).toBeInTheDocument();
    });

    // El formulario debe haberse vaciado
    expect(screen.getByLabelText('contacto.email')).toHaveValue('');
    expect(screen.getByLabelText('contacto.titulo_msg')).toHaveValue('');
    expect(screen.getByLabelText('contacto.mensaje')).toHaveValue('');
  });

  test('Error de servidor muestra alerta al usuario', async () => {
    localStorage.setItem('token', 'jwt_mock_token');

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Error interno del servidor.' }),
    });

    render(
      <MemoryRouter>
        <Contacto />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('contacto.email'), {
      target: { value: 'test@scdi.es', name: 'email' },
    });
    fireEvent.change(screen.getByLabelText('contacto.titulo_msg'), {
      target: { value: 'Consulta errónea', name: 'titulo' },
    });
    fireEvent.change(screen.getByLabelText('contacto.mensaje'), {
      target: { value: 'Este mensaje causará un error.', name: 'mensaje' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'contacto.enviar' }));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        'Error al enviar el mensaje: Error interno del servidor.'
      );
    });
  });
});
