export type TipoFormato = 1 | 2; // 1 = Nacional, 2 = Extranjero

export const TIPO_FORMATO_LABELS: Record<TipoFormato, string> = {
  1: 'Nacional',
  2: 'Extranjero',
};

export interface Formato {
  id: number;
  nombreFormato: string;
  contenidoHTML: string;
  tipo: TipoFormato;
  esEstandar: boolean;
}

export interface CreateFormatoForm {
  nombreFormato: string;
  contenidoHTML: string;
  esEstandar: boolean;
  tipo: TipoFormato;
}

export interface UpdateFormatoForm {
  nombreFormato: string;
  contenidoHTML: string;
  esEstandar: boolean;
  tipo: TipoFormato;
}

// Placeholders obligatorios presentes en ambos formatos estándar
export const REQUIRED_PLACEHOLDERS = [
  '{{Total}}',
  '{{Label_TaxID}}',
  '{{EmisorNombre}}',
  '{{NumeroFactura}}',
] as const;

// Todos los placeholders reconocidos (documentación para el usuario)
export const ALL_PLACEHOLDERS = [
  // Emisor
  '{{EmisorNombre}}',
  '{{EmisorRFC}}',
  '{{EmisorDireccion}}',
  // Factura
  '{{Label_Title}}',
  '{{NumeroFactura}}',
  '{{Fecha}}',
  '{{Label_TaxID}}',
  // Cliente
  '{{Label_To}}',
  '{{ClienteNombre}}',
  '{{Label_For}}',
  '{{ProyectoDescripcion}}',
  // Conceptos (loop)
  '{{#each Conceptos}}',
  '{{Descripcion}}',
  '{{Cantidad}}',
  '{{PrecioUnitario}}',
  '{{Importe}}',
  '{{/each}}',
  // Totales
  '{{Subtotal}}',
  '{{Label_TaxType}}',
  '{{IvaPorcentaje}}',
  '{{IVA}}',
  '{{Label_Currency}}',
  '{{Total}}',
  // Banco
  '{{Label_Bank}}',
  '{{BancoNombre}}',
  '{{CLABE}}',
  '{{SwiftCode}}',
] as const;

// Bloques disponibles en el editor visual
export type BloqueId = 'logo' | 'datos-cliente' | 'tabla-conceptos' | 'totales' | 'datos-bancarios';

export interface BloqueTemplate {
  id: BloqueId;
  label: string;
  html: string;
}

export const BLOQUES_DISPONIBLES: BloqueTemplate[] = [
  {
    id: 'logo',
    label: 'Logo / Encabezado del Emisor',
    html: `<div style="background-color:{{ColorPrimario}};height:10px;width:100%;"></div>
<table style="width:100%;margin-top:10px;">
  <tr>
    <td style="width:60%;border:none;">
      <h1 style="margin:0;color:{{ColorPrimario}};">{{EmisorNombre}}</h1>
      <p style="font-size:12px;margin:5px 0;">
        <strong>{{Label_TaxID}}:</strong> {{EmisorRFC}}<br>{{EmisorDireccion}}
      </p>
    </td>
    <td style="width:40%;border:none;">
      <div style="border:1px solid {{ColorPrimario}};padding:10px;text-align:center;">
        <span style="font-size:10px;color:#7f8c8d;">{{Label_Title}}</span><br>
        <span style="font-size:18px;font-weight:bold;">#{{NumeroFactura}}</span><br>
        <span style="font-size:11px;">Fecha: {{Fecha}}</span>
      </div>
    </td>
  </tr>
</table>`,
  },
  {
    id: 'datos-cliente',
    label: 'Datos del Cliente',
    html: `<table style="width:100%;margin-top:20px;">
  <tr>
    <td style="border:none;">
      <strong style="color:{{ColorPrimario}};">{{Label_To}}</strong><br>
      {{ClienteNombre}}<br>
      <strong>{{Label_For}}:</strong> {{ProyectoDescripcion}}
    </td>
  </tr>
</table>`,
  },
  {
    id: 'tabla-conceptos',
    label: 'Tabla de Conceptos',
    html: `<table style="width:100%;margin-top:20px;border-collapse:collapse;">
  <thead>
    <tr>
      <th style="border-bottom:2px solid {{ColorPrimario}};padding:8px;text-align:left;font-size:12px;">DESCRIPCIÓN</th>
      <th style="border-bottom:2px solid {{ColorPrimario}};padding:8px;text-align:center;font-size:12px;">CANT.</th>
      <th style="border-bottom:2px solid {{ColorPrimario}};padding:8px;text-align:right;font-size:12px;">PRECIO U.</th>
      <th style="border-bottom:2px solid {{ColorPrimario}};padding:8px;text-align:right;font-size:12px;">IMPORTE</th>
    </tr>
  </thead>
  <tbody>
    {{#each Conceptos}}
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;font-size:11px;">{{Descripcion}}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-size:11px;text-align:center;">{{Cantidad}}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-size:11px;text-align:right;">${'$'}{{PrecioUnitario}}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-size:11px;text-align:right;">${'$'}{{Importe}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>`,
  },
  {
    id: 'totales',
    label: 'Totales',
    html: `<table style="width:35%;float:right;margin-top:15px;border-collapse:collapse;">
  <tr>
    <td style="font-size:11px;border:none;">Subtotal:</td>
    <td style="text-align:right;font-size:11px;border:none;">${'$'}{{Subtotal}}</td>
  </tr>
  <tr>
    <td style="font-size:11px;border:none;">{{Label_TaxType}} ({{IvaPorcentaje}}%):</td>
    <td style="text-align:right;font-size:11px;border:none;">${'$'}{{IVA}}</td>
  </tr>
  <tr>
    <td style="font-weight:bold;border-top:1px solid {{ColorPrimario}};border-bottom:none;border-left:none;border-right:none;">TOTAL:</td>
    <td style="text-align:right;font-weight:bold;border-top:1px solid {{ColorPrimario}};border-bottom:none;border-left:none;border-right:none;color:{{ColorSecundario}};">{{Label_Currency}} ${'$'}{{Total}}</td>
  </tr>
</table>
<div style="clear:both;"></div>`,
  },
  {
    id: 'datos-bancarios',
    label: 'Datos Bancarios',
    html: `<div style="border-top:1px solid #ccc;margin-top:30px;font-size:10px;color:#555;">
  <strong>{{Label_Bank}}</strong><br>
  Banco: {{BancoNombre}} | CLABE: {{CLABE}} | SWIFT: {{SwiftCode}}
</div>`,
  },
];
