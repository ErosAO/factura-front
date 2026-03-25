import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../services/authService';

const mockResponse = {
  token: 'jwt-token',
  userId: 'u-1',
  nombreCompleto: 'Admin',
  email: 'admin@test.com',
  rol: 'Administracion',
  expiracion: new Date(Date.now() + 3600 * 1000).toISOString(),
};

function mockFetch(status: number, body: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response);
}

describe('authService', () => {
  beforeEach(() => vi.restoreAllMocks());

  // ── Login exitoso ────────────────────────────────────────────────────────

  it('login devuelve AuthUser en respuesta 200', async () => {
    mockFetch(200, mockResponse);

    const user = await authService.login('admin@test.com', 'Pass1!');

    expect(user.token).toBe('jwt-token');
    expect(user.email).toBe('admin@test.com');
    expect(user.rol).toBe('Administracion');
    expect(user.nombreCompleto).toBe('Admin');
  });

  it('login hace POST al endpoint correcto', async () => {
    mockFetch(200, mockResponse);

    await authService.login('u@test.com', 'pass');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('login envía credenciales en el cuerpo', async () => {
    mockFetch(200, mockResponse);

    await authService.login('u@test.com', 'miPass');

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(options.body as string);
    expect(body.email).toBe('u@test.com');
    expect(body.password).toBe('miPass');
  });

  // ── Login fallido ────────────────────────────────────────────────────────

  it('login lanza error con mensaje correcto en 401', async () => {
    mockFetch(401, 'Credenciales incorrectas');

    // authService lanza el mensaje hardcodeado para 401
    await expect(authService.login('x@x.com', 'wrong')).rejects.toThrow(
      'Correo o contraseña incorrectos'
    );
  });

  it('login lanza error en otras respuestas de error', async () => {
    mockFetch(500, 'Error interno');

    await expect(authService.login('x@x.com', 'pass')).rejects.toThrow();
  });
});
