import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import type { AuthUser } from '../context/AuthContext';

const STORAGE_KEY = 'factura_auth';

const mockUser: AuthUser = {
  userId: 'user-1',
  nombreCompleto: 'Ana Pérez',
  email: 'ana@test.com',
  rol: 'Administracion',
  token: 'fake-token',
  expiracion: new Date(Date.now() + 8 * 3600 * 1000).toISOString(), // 8 h en el futuro
};

// Componente auxiliar para acceder al contexto en los tests
function ConsumerComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'autenticado' : 'no-autenticado'}</span>
      <span data-testid="nombre">{user?.nombreCompleto ?? ''}</span>
      <span data-testid="rol">{user?.rol ?? ''}</span>
      <button onClick={() => login(mockUser)}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <ConsumerComponent />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  // ── Estado inicial ──────────────────────────────────────────────────────

  it('empieza sin usuario autenticado', () => {
    renderWithProvider();
    expect(screen.getByTestId('auth')).toHaveTextContent('no-autenticado');
  });

  // ── login ───────────────────────────────────────────────────────────────

  it('login actualiza el estado de autenticación', async () => {
    renderWithProvider();
    await act(async () => { screen.getByText('Login').click(); });
    expect(screen.getByTestId('auth')).toHaveTextContent('autenticado');
    expect(screen.getByTestId('nombre')).toHaveTextContent('Ana Pérez');
    expect(screen.getByTestId('rol')).toHaveTextContent('Administracion');
  });

  it('login persiste el usuario en localStorage', async () => {
    renderWithProvider();
    await act(async () => { screen.getByText('Login').click(); });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.email).toBe('ana@test.com');
    expect(stored.token).toBe('fake-token');
  });

  // ── logout ──────────────────────────────────────────────────────────────

  it('logout limpia el estado', async () => {
    renderWithProvider();
    await act(async () => { screen.getByText('Login').click(); });
    await act(async () => { screen.getByText('Logout').click(); });
    expect(screen.getByTestId('auth')).toHaveTextContent('no-autenticado');
    expect(screen.getByTestId('nombre')).toHaveTextContent('');
  });

  it('logout elimina el usuario de localStorage', async () => {
    renderWithProvider();
    await act(async () => { screen.getByText('Login').click(); });
    await act(async () => { screen.getByText('Logout').click(); });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  // ── Persistencia entre recargas ─────────────────────────────────────────

  it('carga el usuario desde localStorage si el token es válido', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    renderWithProvider();
    expect(screen.getByTestId('auth')).toHaveTextContent('autenticado');
    expect(screen.getByTestId('nombre')).toHaveTextContent('Ana Pérez');
  });

  it('ignora un token expirado en localStorage', () => {
    const expirado: AuthUser = {
      ...mockUser,
      expiracion: new Date(Date.now() - 1000).toISOString(), // hace 1 s
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expirado));
    renderWithProvider();
    expect(screen.getByTestId('auth')).toHaveTextContent('no-autenticado');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('ignora JSON inválido en localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'no-es-json');
    renderWithProvider();
    expect(screen.getByTestId('auth')).toHaveTextContent('no-autenticado');
  });
});
