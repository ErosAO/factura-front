import type { CreateFormatoForm, Formato, UpdateFormatoForm } from '../types/formato';

const API_BASE = 'https://localhost:7266/formatos';

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

export const formatoService = {
  async getAll(): Promise<Formato[]> {
    const res = await fetch(API_BASE, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener formatos');
    return res.json();
  },

  async getById(id: number): Promise<Formato> {
    const res = await fetch(`${API_BASE}/${id}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Formato no encontrado');
    return res.json();
  },

  async create(data: CreateFormatoForm): Promise<string> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    const msg = await res.text();
    if (!res.ok) throw new Error(msg);
    return msg;
  },

  async update(id: number, data: UpdateFormatoForm): Promise<string> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    const msg = await res.text();
    if (!res.ok) throw new Error(msg);
    return msg;
  },

  async delete(id: number): Promise<string> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const msg = await res.text();
    if (!res.ok) throw new Error(msg);
    return msg;
  },
};
