import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import PanelAdmin from '../src/pages/Administrador/PanelAdmin';

// Mock completo de todos los sub-paneles de administración para mantener el test ágil
vi.mock('../src/components/Administrador/AdminSocios', () => ({
  default: () => <div data-testid="panel-socios">Panel Socios</div>,
}));
vi.mock('../src/components/Administrador/AdminTipos', () => ({
  default: () => <div data-testid="panel-tipos">Panel Tipos de Socio</div>,
}));
vi.mock('../src/components/Administrador/AdminRoles', () => ({
  default: () => <div data-testid="panel-roles">Panel Roles</div>,
}));
vi.mock('../src/components/Administrador/AdminProyectos', () => ({
  default: () => <div data-testid="panel-proyectos">Panel Proyectos</div>,
}));
vi.mock('../src/components/Administrador/AdminArticulos', () => ({
  default: () => <div data-testid="panel-articulos">Panel Artículos</div>,
}));
vi.mock('../src/components/Administrador/AdminEventos', () => ({
  default: () => <div data-testid="panel-eventos">Panel Eventos</div>,
}));
vi.mock('../src/components/Administrador/AdminComites', () => ({
  default: () => <div data-testid="panel-comites">Panel Comités</div>,
}));

describe('Prueba de Integración: Panel de Administración', () => {
  test('Muestra el panel de Socios por defecto al cargar', () => {
    render(
      <MemoryRouter>
        <PanelAdmin />
      </MemoryRouter>
    );

    // La pestaña activa por defecto es "Socios"
    expect(screen.getByTestId('panel-socios')).toBeInTheDocument();
    // El h1 del área principal debe reflejar la pestaña activa
    expect(screen.getByRole('heading', { level: 1, name: 'Socios' })).toBeInTheDocument();
  });

  test('Navegar a la pestaña "Artículos" muestra el panel correcto', () => {
    render(
      <MemoryRouter>
        <PanelAdmin />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /artículos/i }));

    expect(screen.getByTestId('panel-articulos')).toBeInTheDocument();
    expect(screen.queryByTestId('panel-socios')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Artículos' })).toBeInTheDocument();
  });

  test('Navegar a la pestaña "Eventos" muestra el panel correcto', () => {
    render(
      <MemoryRouter>
        <PanelAdmin />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /eventos/i }));

    expect(screen.getByTestId('panel-eventos')).toBeInTheDocument();
    expect(screen.queryByTestId('panel-socios')).not.toBeInTheDocument();
  });

  test('Navegar a la pestaña "Proyectos" muestra el panel correcto', () => {
    render(
      <MemoryRouter>
        <PanelAdmin />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /proyectos/i }));
    expect(screen.getByTestId('panel-proyectos')).toBeInTheDocument();
  });

  test('Navegar a la pestaña "Roles" muestra el panel correcto', () => {
    render(
      <MemoryRouter>
        <PanelAdmin />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /roles/i }));
    expect(screen.getByTestId('panel-roles')).toBeInTheDocument();
  });

  test('Navegar a "Tipos de socio" muestra el panel correcto', () => {
    render(
      <MemoryRouter>
        <PanelAdmin />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /tipos de socio/i }));
    expect(screen.getByTestId('panel-tipos')).toBeInTheDocument();
  });

  test('Navegar a la pestaña "Comités" muestra el panel correcto', () => {
    render(
      <MemoryRouter>
        <PanelAdmin />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /comités/i }));
    expect(screen.getByTestId('panel-comites')).toBeInTheDocument();
  });

  test('Contiene todas las pestañas de navegación en la barra lateral', () => {
    render(
      <MemoryRouter>
        <PanelAdmin />
      </MemoryRouter>
    );

    const expectedTabs = ['Socios', 'Tipos de socio', 'Roles', 'Comités', 'Proyectos', 'Artículos', 'Eventos'];
    expectedTabs.forEach((tab) => {
      // Buscar los botones del sidebar (excluye el h1 principal)
      expect(screen.getAllByText(new RegExp(tab, 'i')).length).toBeGreaterThan(0);
    });
  });
});
