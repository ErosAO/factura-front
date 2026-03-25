import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usuarioService } from '../services/usuarioService';

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

const mockUsuarios = [
  { id: '1', nombreCompleto: 'Ana', email: 'ana@t.com', rol: 'Administracion' },
  { id: '2', nombreCompleto: 'Luis', email: 'luis@t.com', rol: 'Contador' },
];

describe('usuarioService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // ── getAll ───────────────────────────────────────────────────────────────

  it('getAll hace GET al endpoint correcto', async () => {
    mockFetch(200, mockUsuarios);

    await usuarioService.getAll();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users'),
      expect.objectContaining({})
    );
  });

  it('getAll incluye Authorization header cuando hay token', async () => {
    setToken('mi-jwt-token');
    mockFetch(200, mockUsuarios);

    await usuarioService.getAll();

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((options as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer mi-jwt-token',
    });
  });

  it('getAll no incluye Authorization header sin token', async () => {
    mockFetch(200, mockUsuarios);

    await usuarioService.getAll();

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = (options as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('getAll lanza error si la respuesta no es ok', async () => {
    mockFetch(500, 'Error');

    await expect(usuarioService.getAll()).rejects.toThrow('Error al obtener usuarios');
  });

  // ── create ───────────────────────────────────────────────────────────────

  it('create hace POST con los datos correctos', async () => {
    mockFetch(200, 'user-id-nuevo');

    await usuarioService.create({
      nombreCompleto: 'Nuevo',
      email: 'nuevo@t.com',
      password: 'Pass1!',
      rol: 'Usuario',
    });

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((options as RequestInit).method).toBe('POST');
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.nombreCompleto).toBe('Nuevo');
    expect(body.email).toBe('nuevo@t.com');
    expect(body.rol).toBe('Usuario');
  });

  it('create lanza error si la respuesta no es ok', async () => {
    mockFetch(400, 'Rol inválido');

    await expect(usuarioService.create({
      nombreCompleto: 'X', email: 'x@t.com', password: '1', rol: 'Dios'
    })).rejects.toThrow();
  });

  // ── delete ───────────────────────────────────────────────────────────────

  it('delete hace DELETE al endpoint correcto', async () => {
    mockFetch(200, 'Eliminado');

    await usuarioService.delete('user-1');

    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/users/user-1');
    expect((options as RequestInit).method).toBe('DELETE');
  });

  // ── asignarRol ────────────────────────────────────────────────────────────

  it('asignarRol hace PATCH con el rol correcto', async () => {
    mockFetch(200, 'Rol asignado');

    await usuarioService.asignarRol('user-1', 'Contador');

    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/users/user-1/rol');
    expect((options as RequestInit).method).toBe('PATCH');
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.rol).toBe('Contador');
  });
});
