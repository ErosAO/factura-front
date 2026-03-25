import type { CreateUsuarioForm, UpdateUsuarioForm, Usuario } from '../types/usuario';

const API_BASE = 'http://localhost:5139/users';

export const usuarioService = {
  async getAll(): Promise<Usuario[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Error al obtener usuarios');
    return res.json();
  },

  async getById(id: string): Promise<Usuario> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Usuario no encontrado');
    return res.json();
  },

  async create(data: CreateUsuarioForm): Promise<string> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombreCompleto: data.nombreCompleto,
        email: data.email,
        password: data.password,
        rol: data.rol,
      }),
    });
    const msg = await res.text();
    if (!res.ok) throw new Error(msg);
    return msg;
  },

  async update(id: string, data: UpdateUsuarioForm): Promise<string> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const msg = await res.text();
    if (!res.ok) throw new Error(msg);
    return msg;
  },

  async delete(id: string): Promise<string> {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const msg = await res.text();
    if (!res.ok) throw new Error(msg);
    return msg;
  },

  async asignarRol(id: string, rol: string): Promise<string> {
    const res = await fetch(`${API_BASE}/${id}/rol`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol }),
    });
    const msg = await res.text();
    if (!res.ok) throw new Error(msg);
    return msg;
  },
};
