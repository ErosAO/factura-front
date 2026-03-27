import type { AuthUser } from '../context/AuthContext';

const API_BASE = 'http://localhost:5030/auth';

interface LoginResponse {
  token: string;
  userId: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  expiracion: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.status === 401) throw new Error('Correo o contraseña incorrectos');
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || 'Error al iniciar sesión');
    }

    const data: LoginResponse = await res.json();
    return {
      userId: data.userId,
      nombreCompleto: data.nombreCompleto,
      email: data.email,
      rol: data.rol,
      token: data.token,
      expiracion: data.expiracion,
    };
  },
};
