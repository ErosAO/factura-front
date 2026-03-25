export interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  rol: string;
}

export interface CreateUsuarioForm {
  nombreCompleto: string;
  email: string;
  password: string;
  rol: string;
}

export interface UpdateUsuarioForm {
  nombreCompleto: string;
  email: string;
  rol: string;
}

export const ROLES = ['Administracion', 'Contador', 'Usuario'] as const;
export type Rol = typeof ROLES[number];
