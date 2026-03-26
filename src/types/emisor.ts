export interface Emisor {
  id: number;
  nombre: string;
  rfc: string;
  idCIF?: string;
  direccionFiscal?: string;
  regimenFiscal?: string;
  bancoNombre?: string;
  cuentaNumero?: string;
  clabe?: string;
  swiftCode?: string;
  usuarioID?: string;
}

export interface CreateEmisorForm {
  nombre: string;
  rfc: string;
  idCIF: string;
  direccionFiscal: string;
  regimenFiscal: string;
  bancoNombre: string;
  cuentaNumero: string;
  clabe: string;
  swiftCode: string;
}

export interface UpdateEmisorForm extends CreateEmisorForm {}

export const REGIMENES_FISCALES = [
  { codigo: '601', descripcion: '601 - General de Ley Personas Morales' },
  { codigo: '603', descripcion: '603 - Personas Morales con Fines no Lucrativos' },
  { codigo: '605', descripcion: '605 - Sueldos y Salarios' },
  { codigo: '606', descripcion: '606 - Arrendamiento' },
  { codigo: '608', descripcion: '608 - Demás ingresos' },
  { codigo: '612', descripcion: '612 - Personas Físicas con Actividades Empresariales' },
  { codigo: '616', descripcion: '616 - Sin obligaciones fiscales' },
  { codigo: '621', descripcion: '621 - Incorporación Fiscal' },
  { codigo: '622', descripcion: '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
  { codigo: '625', descripcion: '625 - Régimen de Plataformas Tecnológicas' },
  { codigo: '626', descripcion: '626 - Régimen Simplificado de Confianza (RESICO)' },
] as const;
