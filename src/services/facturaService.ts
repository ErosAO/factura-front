import type { FacturaListItem, InsertFacturaDto } from '../types/factura';

const API_BASE = import.meta.env.VITE_API_URL;

function getToken(): string {
  try {
    const raw = localStorage.getItem('factura_auth');
    if (!raw) return '';
    return JSON.parse(raw).token ?? '';
  } catch {
    return '';
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const facturaService = {
  async crear(data: InsertFacturaDto): Promise<Blob> {
    const res = await fetch(`${API_BASE}/Factura`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || 'Error al generar la factura');
    }
    return res.blob();
  },

  async getAll(): Promise<FacturaListItem[]> {
    const res = await fetch(`${API_BASE}/Factura`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener el historial de facturas');
    return res.json();
  },

  async getPdf(id: number): Promise<Blob> {
    const res = await fetch(`${API_BASE}/Factura/${id}/pdf`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al regenerar el PDF');
    return res.blob();
  },
};

export function descargarBlob(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}
