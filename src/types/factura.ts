export interface Factura {
  id: string;
  folio: string;
  cliente: string;
  monto: number;
}

export interface FacturaListItem {
  facturaID: number;
  numeroFactura: string;
  fecha: string;
  clienteNombre: string;
  emisorNombre: string;
  subtotal: number;
  iva: number;
  total: number;
  ivaPorcentaje: number;
  formatoID: number | null;
}

export interface ConceptoForm {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface InsertFacturaDto {
  numeroFactura: string;
  fecha: string;
  perfilEmisorID: number;
  clienteID: number;
  proyecto: string;
  formatoID: number;
  ivaPorcentaje: number;
  conceptos: ConceptoForm[];
}
