import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientesPage from '../components/clientes/ClientesPage';
import { clienteService } from '../services/clienteService';
import type { Cliente } from '../types/cliente';

vi.mock('../services/clienteService');

const mockClientes: Cliente[] = [
  {
    id: 1,
    nombre: 'Distribuidora Nacional SA',
    taxID: 'DNA010101AAA',
    correoContacto: 'contacto@nacional.com',
    tipo: 1,
  },
  {
    id: 2,
    nombre: 'Foreign Corp LLC',
    taxID: 'US-987654321',
    correoContacto: 'info@foreign.com',
    tipo: 2,
  },
];

describe('ClientesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Carga y listado ───────────────────────────────────────────────────────

  it('muestra estado de carga inicial', () => {
    vi.mocked(clienteService.getAll).mockImplementation(() => new Promise(() => {}));
    render(<ClientesPage />);
    expect(screen.getByText(/cargando clientes/i)).toBeInTheDocument();
  });

  it('renderiza la lista de clientes tras carga exitosa', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue(mockClientes);
    render(<ClientesPage />);
    await waitFor(() => {
      expect(screen.getByText('Distribuidora Nacional SA')).toBeInTheDocument();
      expect(screen.getByText('Foreign Corp LLC')).toBeInTheDocument();
    });
  });

  it('muestra los RFC/TaxID en la tabla', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue(mockClientes);
    render(<ClientesPage />);
    await waitFor(() => {
      expect(screen.getByText('DNA010101AAA')).toBeInTheDocument();
      expect(screen.getByText('US-987654321')).toBeInTheDocument();
    });
  });

  it('muestra badge Nacional para tipo 1', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue(mockClientes);
    render(<ClientesPage />);
    await waitFor(() => {
      expect(screen.getByText('Nacional')).toBeInTheDocument();
    });
  });

  it('muestra badge Extranjero para tipo 2', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue(mockClientes);
    render(<ClientesPage />);
    await waitFor(() => {
      expect(screen.getByText('Extranjero')).toBeInTheDocument();
    });
  });

  it('muestra mensaje vacío cuando no hay clientes', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue([]);
    render(<ClientesPage />);
    await waitFor(() => {
      expect(screen.getByText(/no hay clientes registrados/i)).toBeInTheDocument();
    });
  });

  it('muestra error cuando la carga falla', async () => {
    vi.mocked(clienteService.getAll).mockRejectedValue(new Error('Sin conexión'));
    render(<ClientesPage />);
    await waitFor(() => {
      expect(screen.getByText('Sin conexión')).toBeInTheDocument();
    });
  });

  // ── Búsqueda ──────────────────────────────────────────────────────────────

  it('filtra clientes por nombre', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue(mockClientes);
    render(<ClientesPage />);
    await waitFor(() => screen.getByText('Distribuidora Nacional SA'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nombre o rfc/i), {
      target: { value: 'Foreign' },
    });

    expect(screen.queryByText('Distribuidora Nacional SA')).not.toBeInTheDocument();
    expect(screen.getByText('Foreign Corp LLC')).toBeInTheDocument();
  });

  it('filtra clientes por Tax ID', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue(mockClientes);
    render(<ClientesPage />);
    await waitFor(() => screen.getByText('DNA010101AAA'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nombre o rfc/i), {
      target: { value: 'DNA' },
    });

    expect(screen.getByText('Distribuidora Nacional SA')).toBeInTheDocument();
    expect(screen.queryByText('Foreign Corp LLC')).not.toBeInTheDocument();
  });

  // ── Modal crear ───────────────────────────────────────────────────────────

  it('abre el modal al hacer clic en Nuevo Cliente', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue([]);
    render(<ClientesPage />);
    await waitFor(() => screen.getByRole('button', { name: /nuevo cliente/i }));
    await userEvent.click(screen.getByRole('button', { name: /nuevo cliente/i }));
    expect(screen.getByRole('button', { name: /crear cliente/i })).toBeInTheDocument();
  });

  it('cierra el modal al hacer clic en Cancelar', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue([]);
    render(<ClientesPage />);
    await waitFor(() => screen.getByRole('button', { name: /nuevo cliente/i }));
    await userEvent.click(screen.getByRole('button', { name: /nuevo cliente/i }));
    await userEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByRole('button', { name: /crear cliente/i })).not.toBeInTheDocument();
  });

  it('muestra error de validación con RFC nacional inválido', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue([]);
    render(<ClientesPage />);
    await waitFor(() => screen.getByRole('button', { name: /nuevo cliente/i }));
    await userEvent.click(screen.getByRole('button', { name: /nuevo cliente/i }));

    const form = screen.getByRole('button', { name: /crear cliente/i }).closest('form')!;
    const f = within(form);

    fireEvent.change(f.getAllByRole('textbox')[0], { target: { value: 'Mi Cliente' } }); // Razón Social
    fireEvent.change(f.getByPlaceholderText('XAXX010101000'), { target: { value: 'INVALIDO' } });

    await userEvent.click(screen.getByRole('button', { name: /crear cliente/i }));

    await waitFor(() => {
      expect(screen.getByText(/rfc inválido/i)).toBeInTheDocument();
    });
  });

  it('no valida RFC para clientes Extranjeros', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue([]);
    vi.mocked(clienteService.create).mockResolvedValue('Cliente registrado.');
    render(<ClientesPage />);

    await waitFor(() => screen.getByRole('button', { name: /nuevo cliente/i }));
    await userEvent.click(screen.getByRole('button', { name: /nuevo cliente/i }));

    const form = screen.getByRole('button', { name: /crear cliente/i }).closest('form')!;
    const f = within(form);

    fireEvent.change(f.getAllByRole('textbox')[0], { target: { value: 'Foreign Co' } }); // Razón Social

    // Cambiar tipo a Extranjero
    fireEvent.change(f.getAllByRole('combobox')[0], { target: { value: '2' } });

    // Tax ID libre — placeholder cambia a "Alfanumérico"
    await waitFor(() => f.getByPlaceholderText(/alfanumérico/i));
    fireEvent.change(f.getByPlaceholderText(/alfanumérico/i), { target: { value: 'ANY-TAX-ID-123' } });

    await userEvent.click(screen.getByRole('button', { name: /crear cliente/i }));

    await waitFor(() => {
      expect(clienteService.create).toHaveBeenCalled();
    });
  });

  it('llama a clienteService.create y recarga la lista', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue([]);
    vi.mocked(clienteService.create).mockResolvedValue('Cliente registrado.');
    render(<ClientesPage />);

    await waitFor(() => screen.getByRole('button', { name: /nuevo cliente/i }));
    await userEvent.click(screen.getByRole('button', { name: /nuevo cliente/i }));

    const form = screen.getByRole('button', { name: /crear cliente/i }).closest('form')!;
    const f = within(form);

    fireEvent.change(f.getAllByRole('textbox')[0], { target: { value: 'Nueva Empresa' } }); // Razón Social
    fireEvent.change(f.getByPlaceholderText('XAXX010101000'), { target: { value: 'XAXX010101000' } });

    await userEvent.click(screen.getByRole('button', { name: /crear cliente/i }));

    await waitFor(() => {
      expect(clienteService.create).toHaveBeenCalled();
      expect(clienteService.getAll).toHaveBeenCalledTimes(2);
    });
  });

  // ── Modal editar ──────────────────────────────────────────────────────────

  it('abre el modal de editar con datos precargados', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue(mockClientes);
    render(<ClientesPage />);

    await waitFor(() => screen.getAllByRole('button', { name: /editar/i }));
    await userEvent.click(screen.getAllByRole('button', { name: /editar/i })[0]);

    expect(screen.getByDisplayValue('Distribuidora Nacional SA')).toBeInTheDocument();
  });

  // ── Eliminar ──────────────────────────────────────────────────────────────

  it('llama a clienteService.delete al confirmar', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue(mockClientes);
    vi.mocked(clienteService.delete).mockResolvedValue('Eliminado.');
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ClientesPage />);
    await waitFor(() => screen.getAllByRole('button', { name: /eliminar/i }));
    await userEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0]);

    await waitFor(() => {
      expect(clienteService.delete).toHaveBeenCalledWith(1);
    });
  });

  it('no llama a clienteService.delete si se cancela', async () => {
    vi.mocked(clienteService.getAll).mockResolvedValue(mockClientes);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<ClientesPage />);
    await waitFor(() => screen.getAllByRole('button', { name: /eliminar/i }));
    await userEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0]);

    expect(clienteService.delete).not.toHaveBeenCalled();
  });
});
