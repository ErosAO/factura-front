import type { Emisor, CreateEmisorForm, UpdateEmisorForm } from '../types/emisor';

const API_BASE = 'https://localhost:7266/emisores';

function getToken(): string | null {
  const raw = localStorage.getItem('factura_auth');
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

export const emisorService = {
  async getAll(): Promise<Emisor[]> {
    const res = await fetch(API_BASE, { headers: authHeaders() });
    return handleResponse<Emisor[]>(res);
  },

  async getById(id: number): Promise<Emisor> {
    const res = await fetch(`${API_BASE}/${id}`, { headers: authHeaders() });
    return handleResponse<Emisor>(res);
  },

  async create(data: CreateEmisorForm): Promise<string> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        nombre: data.nombre,
        rfc: data.rfc,
        idCIF: data.idCIF,
        direccionFiscal: data.direccionFiscal,
        regimenFiscal: data.regimenFiscal,
        bancoNombre: data.bancoNombre,
        cuentaNumero: data.cuentaNumero,
        clabe: data.clabe,
        swiftCode: data.swiftCode,
      }),
    });
    return handleResponse<string>(res);
  },

  async update(id: number, data: UpdateEmisorForm): Promise<string> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        nombre: data.nombre,
        rfc: data.rfc,
        idCIF: data.idCIF,
        direccionFiscal: data.direccionFiscal,
        regimenFiscal: data.regimenFiscal,
        bancoNombre: data.bancoNombre,
        cuentaNumero: data.cuentaNumero,
        clabe: data.clabe,
        swiftCode: data.swiftCode,
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
