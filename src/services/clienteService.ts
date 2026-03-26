import type { Cliente, CreateClienteForm, UpdateClienteForm } from '../types/cliente';

const API_BASE = 'https://localhost:7266/clientes';

function getToken(): string | null {
  const raw = localStorage.getItem('factura_auth_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw).token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text().catch(() => `Error ${res.status}`);
    throw new Error(msg || `Error ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : (null as T);
}

export const clienteService = {
  async getAll(): Promise<Cliente[]> {
    const res = await fetch(API_BASE, { headers: authHeaders() });
    return handleResponse<Cliente[]>(res);
  },

  async getById(id: number): Promise<Cliente> {
    const res = await fetch(`${API_BASE}/${id}`, { headers: authHeaders() });
    return handleResponse<Cliente>(res);
  },

  async create(data: CreateClienteForm): Promise<string> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        nombre: data.nombre,
        taxID: data.taxID,
        direccion: data.direccion,
        correo: data.correoContacto,
        tipo: data.tipo,
      }),
    });
    return handleResponse<string>(res);
  },

  async update(id: number, data: UpdateClienteForm): Promise<string> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        nombre: data.nombre,
        taxID: data.taxID,
        direccion: data.direccion,
        correo: data.correoContacto,
        tipo: data.tipo,
      }),
    });
    return handleResponse<string>(res);
  },

  async delete(id: number): Promise<string> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<string>(res);
  },
};
