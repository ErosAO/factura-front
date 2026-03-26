export interface Cliente {
  id: number;
  nombre: string;
  taxID?: string;
  direccion?: string;
  correoContacto?: string;
  tipo: number; // 1 = Nacional, 2 = Extranjero
  usuarioID?: string;
}

export interface CreateClienteForm {
  nombre: string;
  taxID: string;
  direccion: string;
  correoContacto: string;
  tipo: number;
}

export interface UpdateClienteForm extends CreateClienteForm {}

export const TIPOS_CLIENTE = [
  { value: 1, label: 'Nacional' },
  { value: 2, label: 'Extranjero' },
] as const;

// RFC mexicano: personas físicas (13 chars) o morales (12 chars)
export const RFC_NACIONAL_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;
