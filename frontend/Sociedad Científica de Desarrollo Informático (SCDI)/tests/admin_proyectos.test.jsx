import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import AdminProyectos from '../src/components/Administrador/AdminProyectos';

describe('Prueba unitaria: AdminProyectos Component', () => {
  const mockProyectos = [
    {
      id_proyecto: 1,
      nombre_proyecto: 'Proyecto Blockchain',
      descripcion: 'Estudio de blockchain corporativo.',
      fecha_inicio: '2025-01-01T00:00:00.000Z',
      fecha_fin: '2026-01-01T00:00:00.000Z',
      estado: 'En curso',
      miembros: [
        { id_socio: 10, nombre_socio: 'Juan Pérez', rol: 'Presidente' },
        { id_socio: 11, nombre_socio: 'María López', rol: 'Secretario' }
      ]
    }
  ];

  const mockSocios = {
    socios: {
      listaSocios: [
        { id_socio: 10, nombre: 'Juan', apellidos: 'Pérez', email: 'juan@scdi.es' },
        { id_socio: 11, nombre: 'María', apellidos: 'López', email: 'maria@scdi.es' },
        { id_socio: 12, nombre: 'Pedro', apellidos: 'García', email: 'pedro@scdi.es' }
      ]
    }
  };

  const mockRoles = {
    roles: [
      { id: 2, nombre: 'Presidente' },
      { id: 3, nombre: 'Secretario' },
      { id: 4, nombre: 'Tesorero' }
    ]
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    localStorage.clear();
    localStorage.setItem('token', 'mocked_admin_token');
  });

  test('Carga y muestra el listado de proyectos y sus miembros', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proyectos: { listaProyectos: mockProyectos } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles
      });

    render(
      <MemoryRouter>
        <AdminProyectos />
      </MemoryRouter>
    );

    expect(screen.getByText(/cargando proyectos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Proyecto Blockchain')).toBeInTheDocument();
      expect(screen.getByText('Estudio de blockchain corporativo.')).toBeInTheDocument();
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María López')).toBeInTheDocument();
    });
  });

  test('Creación exitosa de un nuevo proyecto', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proyectos: { listaProyectos: mockProyectos } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles
      });

    const { container } = render(
      <MemoryRouter>
        <AdminProyectos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^nuevo proyecto$/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^nuevo proyecto$/i }));

    expect(screen.getByRole('heading', { name: /crear nuevo proyecto/i })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/ej. redes neuronales/i), {
      target: { value: 'Nuevo Proyecto IA' }
    });
    fireEvent.change(screen.getByPlaceholderText(/describa los objetivos/i), {
      target: { value: 'Una descripción detallada.' }
    });
    
    // Buscar input fecha_fin por name
    const dateFinInput = container.querySelector('input[name="fecha_fin"]');
    fireEvent.change(dateFinInput, { target: { value: '2027-12-31' } });

    // Mock para crear
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Proyecto creado.' })
    });

    // Mock para refresco
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proyectos: { listaProyectos: [...mockProyectos, { id_proyecto: 2, nombre_proyecto: 'Nuevo Proyecto IA', descripcion: 'Una descripción detallada.', estado: 'Pendiente', miembros: [] }] } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles
      });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(screen.getByText('Proyecto creado con éxito.')).toBeInTheDocument();
      expect(screen.getByText('Nuevo Proyecto IA')).toBeInTheDocument();
    });
  });

  test('Edición exitosa de un proyecto existente', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proyectos: { listaProyectos: mockProyectos } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles
      });

    render(
      <MemoryRouter>
        <AdminProyectos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Proyecto Blockchain')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^editar$/i }));

    expect(screen.getByRole('heading', { name: /editar proyecto/i })).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/ej. redes neuronales/i);
    expect(titleInput.value).toBe('Proyecto Blockchain');

    fireEvent.change(titleInput, { target: { value: 'Proyecto Blockchain Modificado' } });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Proyecto actualizado.' })
    });

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proyectos: { listaProyectos: [{ ...mockProyectos[0], nombre_proyecto: 'Proyecto Blockchain Modificado' }] } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles
      });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(screen.getByText('Proyecto actualizado con éxito.')).toBeInTheDocument();
      expect(screen.getByText('Proyecto Blockchain Modificado')).toBeInTheDocument();
    });
  });

  test('Eliminación exitosa de un proyecto', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proyectos: { listaProyectos: mockProyectos } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles
      });

    render(
      <MemoryRouter>
        <AdminProyectos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Proyecto Blockchain')).toBeInTheDocument();
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Proyecto eliminado.' })
    });

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proyectos: { listaProyectos: [] } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles
      });

    fireEvent.click(screen.getByRole('button', { name: /^eliminar$/i }));

    expect(global.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Proyecto eliminado correctamente.')).toBeInTheDocument();
      expect(screen.queryByText('Proyecto Blockchain')).not.toBeInTheDocument();
    });
  });

  test('Añadir miembro exitosamente a un proyecto', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proyectos: { listaProyectos: mockProyectos } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles
      });

    render(
      <MemoryRouter>
        <AdminProyectos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^miembro$/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^miembro$/i }));

    expect(screen.getByRole('heading', { name: /añadir miembro al proyecto/i })).toBeInTheDocument();

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '12' } }); // Pedro García
    fireEvent.change(selects[1], { target: { value: '4' } }); // Tesorero

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Miembro añadido.' })
    });

    const mockUpdated = [
      {
        ...mockProyectos[0],
        miembros: [
          ...mockProyectos[0].miembros,
          { id_socio: 12, nombre_socio: 'Pedro García', rol: 'Tesorero' }
        ]
      }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proyectos: { listaProyectos: mockUpdated } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles
      });

    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));

    await waitFor(() => {
      expect(screen.getByText('Miembro añadido correctamente.')).toBeInTheDocument();
      expect(screen.getByText('Pedro García')).toBeInTheDocument();
    });
  });

  test('Expulsar miembro de un proyecto', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proyectos: { listaProyectos: mockProyectos } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles
      });

    render(
      <MemoryRouter>
        <AdminProyectos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('María López')).toBeInTheDocument();
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Miembro expulsado.' })
    });

    const mockUpdated = [
      {
        ...mockProyectos[0],
        miembros: [
          { id_socio: 10, nombre_socio: 'Juan Pérez', rol: 'Presidente' }
        ]
      }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ proyectos: { listaProyectos: mockUpdated } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSocios
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles
      });

    const removeButtons = screen.getAllByTitle('Expulsar miembro');
    fireEvent.click(removeButtons[1]); // Expulsar a María López

    expect(global.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Miembro expulsado del proyecto correctamente.')).toBeInTheDocument();
      expect(screen.queryByText('María López')).not.toBeInTheDocument();
    });
  });
});
