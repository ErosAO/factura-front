import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// ── Mocks de módulos internos ────────────────────────────────────────────────

vi.mock('../components/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login</div>,
}));

vi.mock('../components/usuarios/UsuariosPage', () => ({
  default: () => <div data-testid="usuarios-page">Usuarios</div>,
}));

vi.mock('../components/formatos/FormatosPage', () => ({
  default: () => <div data-testid="formatos-page">Formatos</div>,
}));

vi.mock('../components/emisores/EmisoresPage', () => ({
  default: () => <div data-testid="emisores-page">Emisores</div>,
}));

vi.mock('../components/clientes/ClientesPage', () => ({
  default: () => <div data-testid="clientes-page">Clientes</div>,
}));

vi.mock('../components/facturas/CrearFactura', () => ({
  default: ({ onFacturaCreada }: { onFacturaCreada: () => void }) => (
    <div data-testid="crear-factura">CrearFactura</div>
  ),
}));

vi.mock('../components/facturas/ListadoFacturas', () => ({
  default: () => <div data-testid="listado-facturas">ListadoFacturas</div>,
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockAuthContext = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock('../context/AuthContext', () => mockAuthContext);

function buildUser(rol: string) {
  return {
    userId: '1',
    nombreCompleto: 'Test User',
    email: 'test@test.com',
    rol,
    token: 'fake-token',
    expiracion: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
  };
}

function setupAuth(rol: string) {
  mockAuthContext.useAuth.mockReturnValue({
    user: buildUser(rol),
    isAuthenticated: true,
    logout: vi.fn(),
  });
}

// ── Tests: Administracion ────────────────────────────────────────────────────

describe('App — rol Administracion', () => {
  beforeEach(() => setupAuth('Administracion'));

  it('muestra el tab de Usuarios en la navegación', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Usuarios' })).toBeInTheDocument();
  });

  it('puede navegar al módulo de Usuarios', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Usuarios' }));
    expect(screen.getByTestId('usuarios-page')).toBeInTheDocument();
  });

  it('muestra todos los tabs de navegación', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Facturas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Emisores' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clientes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Formatos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Usuarios' })).toBeInTheDocument();
  });
});

// ── Tests: Contador ──────────────────────────────────────────────────────────

describe('App — rol Contador', () => {
  beforeEach(() => setupAuth('Contador'));

  it('NO muestra el tab de Usuarios en la navegación', () => {
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Usuarios' })).not.toBeInTheDocument();
  });

  it('muestra los demás tabs de navegación', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Facturas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Emisores' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clientes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Formatos' })).toBeInTheDocument();
  });

  it('puede navegar a Clientes', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Clientes' }));
    expect(screen.getByTestId('clientes-page')).toBeInTheDocument();
  });

  it('puede navegar a Formatos', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Formatos' }));
    expect(screen.getByTestId('formatos-page')).toBeInTheDocument();
  });

  it('puede navegar a Emisores', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Emisores' }));
    expect(screen.getByTestId('emisores-page')).toBeInTheDocument();
  });
});

// ── Tests: Usuario ───────────────────────────────────────────────────────────

describe('App — rol Usuario', () => {
  beforeEach(() => setupAuth('Usuario'));

  it('NO muestra el tab de Usuarios en la navegación', () => {
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Usuarios' })).not.toBeInTheDocument();
  });

  it('muestra los demás tabs de navegación', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Facturas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Emisores' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clientes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Formatos' })).toBeInTheDocument();
  });

  it('puede navegar a Clientes', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Clientes' }));
    expect(screen.getByTestId('clientes-page')).toBeInTheDocument();
  });

  it('inicia en el dashboard de facturas', () => {
    render(<App />);
    expect(screen.getByTestId('crear-factura')).toBeInTheDocument();
    expect(screen.getByTestId('listado-facturas')).toBeInTheDocument();
  });
});

// ── Tests: sin autenticación ─────────────────────────────────────────────────

describe('App — sin autenticación', () => {
  it('muestra el LoginPage si no está autenticado', () => {
    mockAuthContext.useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });
    render(<App />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});
