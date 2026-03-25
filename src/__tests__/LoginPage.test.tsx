import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../components/LoginPage';

// Mock del contexto de autenticación
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

// Mock del servicio de autenticación
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

import { authService } from '../services/authService';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Renderizado ──────────────────────────────────────────────────────────

  it('muestra el campo de correo', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('usuario@ejemplo.com')).toBeInTheDocument();
  });

  it('muestra el campo de contraseña', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('muestra el botón de entrar', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('muestra el título de la aplicación', () => {
    render(<LoginPage />);
    expect(screen.getByText('FacturaSys')).toBeInTheDocument();
  });

  // ── Envío del formulario ──────────────────────────────────────────────────

  it('llama a authService.login con las credenciales del formulario', async () => {
    const mockUser = {
      userId: '1', nombreCompleto: 'Admin', email: 'a@a.com',
      rol: 'Administracion', token: 'tok', expiracion: new Date().toISOString()
    };
    (authService.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('usuario@ejemplo.com'), {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Pass1234!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('admin@test.com', 'Pass1234!');
    });
  });

  it('llama a login del contexto tras autenticación exitosa', async () => {
    const mockUser = {
      userId: '1', nombreCompleto: 'Admin', email: 'a@a.com',
      rol: 'Administracion', token: 'tok', expiracion: new Date().toISOString()
    };
    (authService.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('usuario@ejemplo.com'), {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Pass1234!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockUser);
    });
  });

  // ── Manejo de errores ─────────────────────────────────────────────────────

  it('muestra mensaje de error cuando el login falla', async () => {
    (authService.login as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Correo o contraseña incorrectos')
    );

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('usuario@ejemplo.com'), {
      target: { value: 'malo@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Correo o contraseña incorrectos')).toBeInTheDocument();
    });
  });

  // ── Estado de carga ───────────────────────────────────────────────────────

  it('muestra texto de carga mientras procesa el login', async () => {
    (authService.login as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // promesa que nunca resuelve
    );

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('usuario@ejemplo.com'), {
      target: { value: 'a@a.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Pass1!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeInTheDocument();
    });
  });
});
