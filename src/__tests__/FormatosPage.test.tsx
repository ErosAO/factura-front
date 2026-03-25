import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormatosPage from '../components/formatos/FormatosPage';
import { formatoService } from '../services/formatoService';
import type { Formato } from '../types/formato';

vi.mock('../services/formatoService');

const mockFormatos: Formato[] = [
  { id: 1, nombreFormato: 'Formato Nacional', contenidoHTML: '<html>{{Total}}</html>', tipo: 1, esEstandar: true },
  { id: 2, nombreFormato: 'Formato Extranjero', contenidoHTML: '<html>{{Label_TaxID}}</html>', tipo: 2, esEstandar: false },
];

describe('FormatosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Carga inicial ─────────────────────────────────────────────────────────

  it('muestra estado de carga inicial', () => {
    vi.mocked(formatoService.getAll).mockResolvedValue([]);
    render(<FormatosPage />);
    expect(screen.getByText(/cargando formatos/i)).toBeInTheDocument();
  });

  it('muestra formatos después de cargar', async () => {
    vi.mocked(formatoService.getAll).mockResolvedValue(mockFormatos);
    render(<FormatosPage />);

    await waitFor(() => {
      expect(screen.getByText('Formato Nacional')).toBeInTheDocument();
      expect(screen.getByText('Formato Extranjero')).toBeInTheDocument();
    });
  });

  it('muestra mensaje cuando no hay formatos', async () => {
    vi.mocked(formatoService.getAll).mockResolvedValue([]);
    render(<FormatosPage />);

    await waitFor(() => {
      expect(screen.getByText(/no hay formatos registrados/i)).toBeInTheDocument();
    });
  });

  it('muestra error si falla la carga', async () => {
    vi.mocked(formatoService.getAll).mockRejectedValue(new Error('Error al obtener formatos'));
    render(<FormatosPage />);

    await waitFor(() => {
      expect(screen.getByText('Error al obtener formatos')).toBeInTheDocument();
    });
  });

  // ── Badges tipo ───────────────────────────────────────────────────────────

  it('muestra badge "Nacional" para tipo 1', async () => {
    vi.mocked(formatoService.getAll).mockResolvedValue(mockFormatos);
    render(<FormatosPage />);

    await waitFor(() => {
      expect(screen.getByText('Nacional')).toBeInTheDocument();
    });
  });

  it('muestra badge "Extranjero" para tipo 2', async () => {
    vi.mocked(formatoService.getAll).mockResolvedValue(mockFormatos);
    render(<FormatosPage />);

    await waitFor(() => {
      expect(screen.getByText('Extranjero')).toBeInTheDocument();
    });
  });

  it('muestra badge "Estándar" cuando esEstandar es true', async () => {
    vi.mocked(formatoService.getAll).mockResolvedValue(mockFormatos);
    render(<FormatosPage />);

    await waitFor(() => {
      expect(screen.getByText('Estándar')).toBeInTheDocument();
    });
  });

  // ── Botón nuevo formato ────────────────────────────────────────────────────

  it('abre el editor al hacer clic en "+ Nuevo Formato"', async () => {
    vi.mocked(formatoService.getAll).mockResolvedValue([]);
    render(<FormatosPage />);

    await waitFor(() => screen.getByText('+ Nuevo Formato'));
    await userEvent.click(screen.getByText('+ Nuevo Formato'));

    expect(screen.getByText('Nuevo Formato')).toBeInTheDocument();
  });

  // ── Editar ────────────────────────────────────────────────────────────────

  it('abre el editor de edición al hacer clic en Editar', async () => {
    vi.mocked(formatoService.getAll).mockResolvedValue(mockFormatos);
    render(<FormatosPage />);

    await waitFor(() => screen.getAllByText('Editar'));
    await userEvent.click(screen.getAllByText('Editar')[0]);

    expect(screen.getByText(/Editar: Formato Nacional/)).toBeInTheDocument();
  });

  // ── Eliminar ──────────────────────────────────────────────────────────────

  it('llama a formatoService.delete al confirmar eliminación', async () => {
    vi.mocked(formatoService.getAll).mockResolvedValue(mockFormatos);
    vi.mocked(formatoService.delete).mockResolvedValue('Formato eliminado exitosamente.');
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<FormatosPage />);

    await waitFor(() => screen.getAllByText('Eliminar'));
    await userEvent.click(screen.getAllByText('Eliminar')[0]);

    expect(formatoService.delete).toHaveBeenCalledWith(1);
  });

  it('no llama a formatoService.delete si se cancela la confirmación', async () => {
    vi.mocked(formatoService.getAll).mockResolvedValue(mockFormatos);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<FormatosPage />);

    await waitFor(() => screen.getAllByText('Eliminar'));
    await userEvent.click(screen.getAllByText('Eliminar')[0]);

    expect(formatoService.delete).not.toHaveBeenCalled();
  });

  // ── Cerrar modal ──────────────────────────────────────────────────────────

  it('cierra el editor al hacer clic en Cancelar', async () => {
    vi.mocked(formatoService.getAll).mockResolvedValue([]);
    render(<FormatosPage />);

    await waitFor(() => screen.getByText('+ Nuevo Formato'));
    await userEvent.click(screen.getByText('+ Nuevo Formato'));
    await userEvent.click(screen.getByText('Cancelar'));

    expect(screen.queryByText('Guardar Formato')).not.toBeInTheDocument();
  });
});
