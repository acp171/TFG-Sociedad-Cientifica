const { slugify } = require('../../src/utils/slugify');

describe('slugify()', () => {
  test('convierte texto simple a slug en minúsculas', () => {
    expect(slugify('Hola Mundo')).toBe('hola-mundo');
  });

  test('elimina tildes y diacríticos', () => {
    expect(slugify('Avances en Computación Cuántica')).toBe('avances-en-computacion-cuantica');
  });

  test('elimina la ñ correctamente', () => {
    expect(slugify('España e Innovación')).toBe('espana-e-innovacion');
  });

  test('reemplaza espacios múltiples por un solo guion', () => {
    expect(slugify('Machine   Learning   aplicado')).toBe('machine-learning-aplicado');
  });

  test('elimina caracteres especiales', () => {
    expect(slugify('Congreso Nacional de IA 2026!')).toBe('congreso-nacional-de-ia-2026');
  });

  test('elimina guiones dobles', () => {
    expect(slugify('Seguridad -- en redes')).toBe('seguridad-en-redes');
  });

  test('elimina espacios al inicio y al final', () => {
    expect(slugify('  Proyecto de Investigación  ')).toBe('proyecto-de-investigacion');
  });

  test('texto ya en minúsculas permanece igual', () => {
    expect(slugify('hola-mundo')).toBe('hola-mundo');
  });
});
