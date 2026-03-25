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

// Placeholders obligatorios que deben estar en el HTML
export const REQUIRED_PLACEHOLDERS = [
  '{{Total}}',
  '{{Label_TaxID}}',
] as const;

// Bloques disponibles en el editor visual
export type BloqueId = 'logo' | 'tabla-conceptos' | 'totales' | 'datos-bancarios';

export interface BloqueTemplate {
  id: BloqueId;
  label: string;
  html: string;
}

export const BLOQUES_DISPONIBLES: BloqueTemplate[] = [
  {
    id: 'logo',
    label: 'Logo',
    html: `<div class="bloque-logo" style="text-align:center;padding:16px;">
  <img src="{{LogoURL}}" alt="Logo" style="max-height:80px;" />
  <h2 style="color:{{ColorPrimario}};margin:8px 0;">{{NombreEmisor}}</h2>
  <p style="color:#666;">RFC: {{Label_TaxID}}</p>
</div>`,
  },
  {
    id: 'tabla-conceptos',
    label: 'Tabla de Conceptos',
    html: `<table class="bloque-conceptos" style="width:100%;border-collapse:collapse;margin:16px 0;">
  <thead>
    <tr style="background:{{ColorPrimario}};color:#fff;">
      <th style="padding:8px;text-align:left;">Descripción</th>
      <th style="padding:8px;text-align:right;">Cantidad</th>
      <th style="padding:8px;text-align:right;">Precio Unit.</th>
      <th style="padding:8px;text-align:right;">Importe</th>
    </tr>
  </thead>
  <tbody>
    {{#Conceptos}}
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px;">{{Descripcion}}</td>
      <td style="padding:8px;text-align:right;">{{Cantidad}}</td>
      <td style="padding:8px;text-align:right;">{{PrecioUnitario}}</td>
      <td style="padding:8px;text-align:right;">{{Importe}}</td>
    </tr>
    {{/Conceptos}}
  </tbody>
</table>`,
  },
  {
    id: 'totales',
    label: 'Totales',
    html: `<div class="bloque-totales" style="text-align:right;padding:16px;border-top:2px solid {{ColorPrimario}};">
  <p>Subtotal: <strong>{{Subtotal}}</strong></p>
  <p>IVA (16%): <strong>{{IVA}}</strong></p>
  <p style="font-size:1.25em;color:{{ColorPrimario}};">Total: <strong>{{Total}}</strong></p>
</div>`,
  },
  {
    id: 'datos-bancarios',
    label: 'Datos Bancarios',
    html: `<div class="bloque-bancario" style="padding:16px;background:#f8fafc;border-left:4px solid {{ColorSecundario}};margin-top:16px;">
  <h4 style="color:{{ColorSecundario}};margin:0 0 8px;">Datos Bancarios</h4>
  <p>Banco: {{BancoNombre}}</p>
  <p>Cuenta: {{CuentaNumero}}</p>
  <p>CLABE: {{CLABE}}</p>
  <p>SWIFT: {{SwiftCode}}</p>
</div>`,
  },
];
