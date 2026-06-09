import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import AdminComites from '../src/components/Administrador/AdminComites';

describe('Prueba unitaria: AdminComites Component', () => {
  const mockComites = [
    {
      id_comite: 1,
      nombre_comite: 'Comité de Ciberseguridad',
      descripcion: 'Investigación en ciberseguridad.',
      miembros: [
        { id_socio: 10, nombre_socio: 'Carlos Gómez', rol: 'Presidente' },
        { id_socio: 11, nombre_socio: 'Ana Martínez', rol: 'Secretario' }
      ]
    }
  ];

  const mockSocios = {
    socios: {
      listaSocios: [
        { id_socio: 10, nombre: 'Carlos', apellidos: 'Gómez', email: 'carlos@scdi.es' },
        { id_socio: 11, nombre: 'Ana', apellidos: 'Martínez', email: 'ana@scdi.es' },
        { id_socio: 12, nombre: 'Luis', apellidos: 'Pérez', email: 'luis@scdi.es' }
      ]
    }
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    localStorage.clear();
    localStorage.setItem('token', 'mocked_admin_token');
  });

  test('Carga y muestra el listado de comités y miembros', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ listadoComites: mockComites })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      });

    render(
      <MemoryRouter>
        <AdminComites />
      </MemoryRouter>
    );

    // Debe mostrar cargando inicialmente
    expect(screen.getByText(/cargando comités/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Comité de Ciberseguridad')).toBeInTheDocument();
      expect(screen.getByText('Investigación en ciberseguridad.')).toBeInTheDocument();
      expect(screen.getByText('Carlos Gómez')).toBeInTheDocument();
      expect(screen.getByText('Ana Martínez')).toBeInTheDocument();
    });
  });

  test('Creación exitosa de un nuevo comité', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ listadoComites: mockComites })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      });

    render(
      <MemoryRouter>
        <AdminComites />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nuevo comité/i })).toBeInTheDocument();
    });

    // Abrir formulario
    fireEvent.click(screen.getByRole('button', { name: /nuevo comité/i }));

    expect(screen.getByRole('heading', { name: /crear nuevo comité/i })).toBeInTheDocument();

    // Rellenar campos
    fireEvent.change(screen.getByPlaceholderText(/ej. comité de/i), {
      target: { value: 'Comité de IA' }
    });
    fireEvent.change(screen.getByPlaceholderText(/describa el propósito/i), {
      target: { value: 'Investigación en inteligencia artificial.' }
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '12' } // Luis Pérez
    });

    // Mock para la llamada a crear comité
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Comité científico creado con éxito.' })
    });

    // Mock para refrescar datos tras la creación
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ listadoComites: [...mockComites, { id_comite: 2, nombre_comite: 'Comité de IA', descripcion: 'Investigación en inteligencia artificial.', miembros: [] }] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      });

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: 'Crear Comité' }));

    await waitFor(() => {
      expect(screen.getByText('Comité científico creado con éxito.')).toBeInTheDocument();
      expect(screen.getByText('Comité de IA')).toBeInTheDocument();
    });
  });

  test('Eliminación exitosa de un comité', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ listadoComites: mockComites })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      });

    render(
      <MemoryRouter>
        <AdminComites />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Comité de Ciberseguridad')).toBeInTheDocument();
    });

    // Mock para la llamada a eliminar comité
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Comité científico eliminado.' })
    });

    // Mock para refrescar datos vacío
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ listadoComites: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      });

    // Click eliminar
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(global.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Comité científico eliminado correctamente.')).toBeInTheDocument();
      expect(screen.queryByText('Comité de Ciberseguridad')).not.toBeInTheDocument();
    });
  });

  test('Añadir miembro exitosamente a un comité', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ listadoComites: mockComites })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      });

    render(
      <MemoryRouter>
        <AdminComites />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /añadir miembro/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /añadir miembro/i }));

    expect(screen.getByRole('heading', { name: /añadir miembro/i })).toBeInTheDocument();

    // Seleccionar socio
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '12' } }); // Luis
    fireEvent.change(selects[1], { target: { value: '5' } }); // Vocal

    // Mock de añadir miembro
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Miembro añadido correctamente.' })
    });

    // Mock de refresco
    const mockComitesUpdated = [
      {
        id_comite: 1,
        nombre_comite: 'Comité de Ciberseguridad',
        descripcion: 'Investigación en ciberseguridad.',
        miembros: [
          { id_socio: 10, nombre_socio: 'Carlos Gómez', rol: 'Presidente' },
          { id_socio: 11, nombre_socio: 'Ana Martínez', rol: 'Secretario' },
          { id_socio: 12, nombre_socio: 'Luis Pérez', rol: 'Vocal' }
        ]
      }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ listadoComites: mockComitesUpdated })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      });

    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));

    await waitFor(() => {
      expect(screen.getByText('Miembro añadido correctamente.')).toBeInTheDocument();
      expect(screen.getByText('Luis Pérez')).toBeInTheDocument();
    });
  });

  test('Expulsar miembro de un comité', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ listadoComites: mockComites })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      });

    render(
      <MemoryRouter>
        <AdminComites />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Carlos Gómez')).toBeInTheDocument();
    });

    // Mock de expulsar miembro
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Miembro expulsado.' })
    });

    // Mock de refresco
    const mockComitesUpdated = [
      {
        id_comite: 1,
        nombre_comite: 'Comité de Ciberseguridad',
        descripcion: 'Investigación en ciberseguridad.',
        miembros: [
          { id_socio: 10, nombre_socio: 'Carlos Gómez', rol: 'Presidente' }
        ]
      }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ listadoComites: mockComitesUpdated })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      });

    // Expulsar a Ana (la segunda de la lista / boton de expulsar)
    const removeButtons = screen.getAllByTitle('Expulsar miembro');
    fireEvent.click(removeButtons[1]); // Botón para Ana Martínez (índice 1)

    expect(global.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Miembro expulsado del comité correctamente.')).toBeInTheDocument();
      expect(screen.queryByText('Ana Martínez')).not.toBeInTheDocument();
    });
  });
});
