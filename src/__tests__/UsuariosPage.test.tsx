import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UsuariosPage from '../components/usuarios/UsuariosPage';

// Mock: contexto de auth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { userId: '1', nombreCompleto: 'Admin', email: 'a@a.com', rol: 'Administracion', token: 'tok' },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

// Mock: servicio de usuarios
vi.mock('../services/usuarioService', () => ({
  usuarioService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    asignarRol: vi.fn(),
  },
}));

import { usuarioService } from '../services/usuarioService';

const mockUsuarios = [
  { id: '1', nombreCompleto: 'Ana López', email: 'ana@t.com', rol: 'Administracion' },
  { id: '2', nombreCompleto: 'Carlos Ruiz', email: 'carlos@t.com', rol: 'Contador' },
];

describe('UsuariosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Carga y listado ───────────────────────────────────────────────────────

  it('muestra estado de carga inicial', () => {
    (usuarioService.getAll as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );
    render(<UsuariosPage />);
    expect(screen.getByText(/cargando usuarios/i)).toBeInTheDocument();
  });

  it('renderiza la lista de usuarios tras carga exitosa', async () => {
    (usuarioService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockUsuarios);

    render(<UsuariosPage />);

    await waitFor(() => {
      expect(screen.getByText('Ana López')).toBeInTheDocument();
      expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument();
    });
  });

  it('muestra los emails de los usuarios', async () => {
    (usuarioService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockUsuarios);
    render(<UsuariosPage />);
    await waitFor(() => {
      expect(screen.getByText('ana@t.com')).toBeInTheDocument();
    });
  });

  it('muestra los badges de rol correctamente', async () => {
    (usuarioService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockUsuarios);
    render(<UsuariosPage />);
    await waitFor(() => {
      expect(screen.getByText('Administracion')).toBeInTheDocument();
      expect(screen.getByText('Contador')).toBeInTheDocument();
    });
  });

  it('muestra estado vacío cuando no hay usuarios', async () => {
    (usuarioService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<UsuariosPage />);
    await waitFor(() => {
      expect(screen.getByText(/no hay usuarios registrados/i)).toBeInTheDocument();
    });
  });

  it('muestra error cuando la carga falla', async () => {
    (usuarioService.getAll as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Error al obtener usuarios')
    );
    render(<UsuariosPage />);
    await waitFor(() => {
      expect(screen.getByText('Error al obtener usuarios')).toBeInTheDocument();
    });
  });

  // ── Botones de acción ─────────────────────────────────────────────────────

  it('muestra el botón de crear usuario', async () => {
    (usuarioService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<UsuariosPage />);
    await waitFor(() => {
      expect(screen.getByText(/nuevo usuario/i)).toBeInTheDocument();
    });
  });

  it('abre el modal de crear al hacer clic en Nuevo Usuario', async () => {
    (usuarioService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<UsuariosPage />);

    await waitFor(() => screen.getByText(/nuevo usuario/i));
    fireEvent.click(screen.getByText(/nuevo usuario/i));

    expect(screen.getByText('Nuevo Usuario')).toBeInTheDocument();
  });

  it('cierra el modal al hacer clic en Cancelar', async () => {
    (usuarioService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<UsuariosPage />);

    await waitFor(() => screen.getByText(/nuevo usuario/i));
    fireEvent.click(screen.getByText(/nuevo usuario/i));

    const cancelButton = screen.getAllByText(/cancelar/i)[0];
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Crear Usuario')).not.toBeInTheDocument();
    });
  });

  // ── Creación de usuario ───────────────────────────────────────────────────

  it('llama a usuarioService.create y recarga la lista al crear un usuario', async () => {
    (usuarioService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockUsuarios);
    (usuarioService.create as ReturnType<typeof vi.fn>).mockResolvedValue('new-id');

    render(<UsuariosPage />);
    await waitFor(() => screen.getByText(/nuevo usuario/i));
    fireEvent.click(screen.getByText(/nuevo usuario/i));

    // Los inputs dentro del modal (el modal de crear tiene orden: nombre, email, password, rol)
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Nuevo Usuario' } }); // Nombre
    fireEvent.change(inputs[1], { target: { value: 'nuevo@t.com' } });   // Email

    // El password es type="password", no lo detecta getAllByRole('textbox')
    const passwordInput = screen.getByPlaceholderText(/mín\. 8/i);
    fireEvent.change(passwordInput, { target: { value: 'Pass1234!' } });

    fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }));

    await waitFor(() => {
      expect(usuarioService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nombreCompleto: 'Nuevo Usuario',
          email: 'nuevo@t.com',
          password: 'Pass1234!',
        })
      );
      expect(usuarioService.getAll).toHaveBeenCalledTimes(2); // inicial + tras crear
    });
  });

  // ── Eliminación ───────────────────────────────────────────────────────────

  it('llama a usuarioService.delete al confirmar eliminación', async () => {
    (usuarioService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockUsuarios);
    (usuarioService.delete as ReturnType<typeof vi.fn>).mockResolvedValue('ok');
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<UsuariosPage />);
    await waitFor(() => screen.getAllByText(/eliminar/i));

    fireEvent.click(screen.getAllByText(/eliminar/i)[0]);

    await waitFor(() => {
      expect(usuarioService.delete).toHaveBeenCalledWith('1');
    });
  });

  it('no llama a delete cuando el usuario cancela la confirmación', async () => {
    (usuarioService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockUsuarios);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<UsuariosPage />);
    await waitFor(() => screen.getAllByText(/eliminar/i));

    fireEvent.click(screen.getAllByText(/eliminar/i)[0]);

    expect(usuarioService.delete).not.toHaveBeenCalled();
  });
});
