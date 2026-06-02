import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Limpieza automática del DOM de jsdom después de cada test
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Mock simple de elementos globales si es necesario (ej: scrollTo, LocalStorage)
Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true });
