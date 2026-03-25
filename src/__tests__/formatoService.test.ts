import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatoService } from '../services/formatoService';

const STORAGE_KEY = 'factura_auth';

function setToken(token: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
}

function mockFetch(status: number, body: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as Response);
}

const mockFormatos = [
  { id: 1, nombreFormato: 'Formato A', contenidoHTML: '<html>{{Total}}</html>', tipo: 1, esEstandar: true },
  { id: 2, nombreFormato: 'Formato B', contenidoHTML: '<html>{{Label_TaxID}}</html>', tipo: 2, esEstandar: false },
];

describe('formatoService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // ── getAll ───────────────────────────────────────────────────────────────

  it('getAll hace GET al endpoint /formatos', async () => {
    mockFetch(200, mockFormatos);

    await formatoService.getAll();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/formatos'),
      expect.objectContaining({})
    );
  });

  it('getAll incluye Authorization header cuando hay token', async () => {
    setToken('mi-jwt-token');
    mockFetch(200, mockFormatos);

    await formatoService.getAll();

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((options as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer mi-jwt-token',
    });
  });

  it('getAll no incluye Authorization header sin token', async () => {
    mockFetch(200, mockFormatos);

    await formatoService.getAll();

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = (options as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('getAll lanza error si la respuesta no es ok', async () => {
    mockFetch(500, 'Error del servidor');

    await expect(formatoService.getAll()).rejects.toThrow('Error al obtener formatos');
  });

  // ── getById ───────────────────────────────────────────────────────────────

  it('getById hace GET al endpoint correcto con id', async () => {
    mockFetch(200, mockFormatos[0]);

    await formatoService.getById(1);

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/formatos/1');
  });

  it('getById lanza error si no existe', async () => {
    mockFetch(404, 'No encontrado');

    await expect(formatoService.getById(999)).rejects.toThrow('Formato no encontrado');
  });

  // ── create ───────────────────────────────────────────────────────────────

  it('create hace POST con los datos correctos', async () => {
    mockFetch(200, 'ID generado: 1');

    await formatoService.create({
      nombreFormato: 'Nuevo Formato',
      contenidoHTML: '<html>{{Total}}</html>',
      esEstandar: true,
      tipo: 1,
    });

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((options as RequestInit).method).toBe('POST');
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.nombreFormato).toBe('Nuevo Formato');
    expect(body.tipo).toBe(1);
    expect(body.esEstandar).toBe(true);
  });

  it('create lanza error si la respuesta no es ok', async () => {
    mockFetch(400, 'HTML nulo no permitido');

    await expect(formatoService.create({
      nombreFormato: 'X',
      contenidoHTML: '',
      esEstandar: false,
      tipo: 1,
    })).rejects.toThrow();
  });

  // ── update ───────────────────────────────────────────────────────────────

  it('update hace PUT al endpoint correcto', async () => {
    mockFetch(200, 'Formato actualizado exitosamente.');

    await formatoService.update(1, {
      nombreFormato: 'Actualizado',
      contenidoHTML: '<html>{{Total}}</html>',
      esEstandar: false,
      tipo: 2,
    });

    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/formatos/1');
    expect((options as RequestInit).method).toBe('PUT');
  });

  it('update lanza error si el formato no existe', async () => {
    mockFetch(404, 'Formato no encontrado.');

    await expect(formatoService.update(999, {
      nombreFormato: 'X',
      contenidoHTML: '<html></html>',
      esEstandar: false,
      tipo: 1,
    })).rejects.toThrow();
  });

  // ── delete ───────────────────────────────────────────────────────────────

  it('delete hace DELETE al endpoint correcto', async () => {
    mockFetch(200, 'Formato eliminado exitosamente.');

    await formatoService.delete(1);

    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/formatos/1');
    expect((options as RequestInit).method).toBe('DELETE');
  });

  it('delete lanza error si el formato no existe', async () => {
    mockFetch(404, 'Formato no encontrado.');

    await expect(formatoService.delete(999)).rejects.toThrow();
  });
});
