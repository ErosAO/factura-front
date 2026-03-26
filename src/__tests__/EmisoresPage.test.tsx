import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmisoresPage from '../components/emisores/EmisoresPage';
import { emisorService } from '../services/emisorService';
import type { Emisor } from '../types/emisor';

vi.mock('../services/emisorService');

const mockEmisores: Emisor[] = [
  {
    id: 1,
    nombre: 'Empresa ABC SA de CV',
    rfc: 'EAB010101ABC',
    regimenFiscal: '626',
    bancoNombre: 'BBVA',
    clabe: '012345678901234567',
  },
  {
    id: 2,
    nombre: 'Servicios XYZ SA',
    rfc: 'SXY020202XYZ',
    regimenFiscal: '601',
    bancoNombre: 'Banamex',
  },
];

describe('EmisoresPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Carga y listado ───────────────────────────────────────────────────────

  it('muestra estado de carga inicial', () => {
    vi.mocked(emisorService.getAll).mockImplementation(() => new Promise(() => {}));
    render(<EmisoresPage />);
    expect(screen.getByText(/cargando emisores/i)).toBeInTheDocument();
  });

  it('renderiza la lista de emisores tras carga exitosa', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue(mockEmisores);
    render(<EmisoresPage />);
    await waitFor(() => {
      expect(screen.getByText('Empresa ABC SA de CV')).toBeInTheDocument();
      expect(screen.getByText('Servicios XYZ SA')).toBeInTheDocument();
    });
  });

  it('muestra los RFC en la tabla', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue(mockEmisores);
    render(<EmisoresPage />);
    await waitFor(() => {
      expect(screen.getByText('EAB010101ABC')).toBeInTheDocument();
    });
  });

  it('muestra mensaje vacío cuando no hay emisores', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue([]);
    render(<EmisoresPage />);
    await waitFor(() => {
      expect(screen.getByText(/no hay emisores registrados/i)).toBeInTheDocument();
    });
  });

  it('muestra error cuando la carga falla', async () => {
    vi.mocked(emisorService.getAll).mockRejectedValue(new Error('Error de red'));
    render(<EmisoresPage />);
    await waitFor(() => {
      expect(screen.getByText('Error de red')).toBeInTheDocument();
    });
  });

  // ── Búsqueda ──────────────────────────────────────────────────────────────

  it('filtra emisores por nombre', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue(mockEmisores);
    render(<EmisoresPage />);
    await waitFor(() => screen.getByText('Empresa ABC SA de CV'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nombre o rfc/i), {
      target: { value: 'ABC' },
    });

    expect(screen.getByText('Empresa ABC SA de CV')).toBeInTheDocument();
    expect(screen.queryByText('Servicios XYZ SA')).not.toBeInTheDocument();
  });

  it('filtra emisores por RFC', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue(mockEmisores);
    render(<EmisoresPage />);
    await waitFor(() => screen.getByText('EAB010101ABC'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nombre o rfc/i), {
      target: { value: 'SXY' },
    });

    expect(screen.queryByText('Empresa ABC SA de CV')).not.toBeInTheDocument();
    expect(screen.getByText('Servicios XYZ SA')).toBeInTheDocument();
  });

  // ── Modal crear ───────────────────────────────────────────────────────────

  it('muestra el botón Nuevo Emisor', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue([]);
    render(<EmisoresPage />);
    await waitFor(() => expect(screen.getByText(/nuevo emisor/i)).toBeInTheDocument());
  });

  it('abre el modal al hacer clic en Nuevo Emisor', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue([]);
    render(<EmisoresPage />);
    await waitFor(() => screen.getByRole('button', { name: /nuevo emisor/i }));
    await userEvent.click(screen.getByRole('button', { name: /nuevo emisor/i }));
    // El modal muestra el botón de submit "Crear Emisor"
    expect(screen.getByRole('button', { name: /crear emisor/i })).toBeInTheDocument();
  });

  it('cierra el modal al hacer clic en Cancelar', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue([]);
    render(<EmisoresPage />);
    await waitFor(() => screen.getByRole('button', { name: /nuevo emisor/i }));
    await userEvent.click(screen.getByRole('button', { name: /nuevo emisor/i }));
    await userEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByRole('button', { name: /crear emisor/i })).not.toBeInTheDocument();
  });

  it('muestra error de validación con RFC inválido', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue([]);
    render(<EmisoresPage />);
    await waitFor(() => screen.getByRole('button', { name: /nuevo emisor/i }));
    await userEvent.click(screen.getByRole('button', { name: /nuevo emisor/i }));

    const form = screen.getByRole('button', { name: /crear emisor/i }).closest('form')!;
    const f = within(form);

    fireEvent.change(f.getAllByRole('textbox')[0], { target: { value: 'Mi Empresa' } }); // Nombre
    fireEvent.change(f.getByPlaceholderText('XAXX010101000'), { target: { value: 'RFC-INVALIDO' } });

    await userEvent.click(screen.getByRole('button', { name: /crear emisor/i }));

    await waitFor(() => {
      expect(screen.getByText(/rfc inválido/i)).toBeInTheDocument();
    });
  });

  it('llama a emisorService.create con RFC válido y recarga lista', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue([]);
    vi.mocked(emisorService.create).mockResolvedValue('Perfil Emisor creado.');
    render(<EmisoresPage />);

    await waitFor(() => screen.getByRole('button', { name: /nuevo emisor/i }));
    await userEvent.click(screen.getByRole('button', { name: /nuevo emisor/i }));

    const form = screen.getByRole('button', { name: /crear emisor/i }).closest('form')!;
    const f = within(form);

    fireEvent.change(f.getAllByRole('textbox')[0], { target: { value: 'Mi Empresa SA' } }); // Nombre
    fireEvent.change(f.getByPlaceholderText('XAXX010101000'), { target: { value: 'XAXX010101000' } });

    await userEvent.click(screen.getByRole('button', { name: /crear emisor/i }));

    await waitFor(() => {
      expect(emisorService.create).toHaveBeenCalled();
      expect(emisorService.getAll).toHaveBeenCalledTimes(2);
    });
  });

  // ── Modal editar ──────────────────────────────────────────────────────────

  it('abre el modal de editar con datos precargados', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue(mockEmisores);
    render(<EmisoresPage />);

    await waitFor(() => screen.getAllByText(/editar/i));
    await userEvent.click(screen.getAllByRole('button', { name: /editar/i })[0]);

    expect(screen.getByDisplayValue('Empresa ABC SA de CV')).toBeInTheDocument();
    expect(screen.getByDisplayValue('EAB010101ABC')).toBeInTheDocument();
  });

  // ── Eliminar ──────────────────────────────────────────────────────────────

  it('llama a emisorService.delete al confirmar', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue(mockEmisores);
    vi.mocked(emisorService.delete).mockResolvedValue('Eliminado.');
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<EmisoresPage />);
    await waitFor(() => screen.getAllByRole('button', { name: /eliminar/i }));
    await userEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0]);

    await waitFor(() => {
      expect(emisorService.delete).toHaveBeenCalledWith(1);
    });
  });

  it('no llama a emisorService.delete si se cancela', async () => {
    vi.mocked(emisorService.getAll).mockResolvedValue(mockEmisores);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<EmisoresPage />);
    await waitFor(() => screen.getAllByRole('button', { name: /eliminar/i }));
    await userEvent.click(screen.getAllByRole('button', { name: /eliminar/i })[0]);

    expect(emisorService.delete).not.toHaveBeenCalled();
  });
});
