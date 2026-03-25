import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Trash2, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { facturaService, descargarBlob } from '../../services/facturaService';
import { formatoService } from '../../services/formatoService';
import type { ConceptoForm } from '../../types/factura';
import type { Formato } from '../../types/formato';

const API_BASE = 'https://localhost:7266';

function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem('factura_auth');
    const token = raw ? JSON.parse(raw).token : '';
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  } catch { return { 'Content-Type': 'application/json' }; }
}

interface Emisor { id: number; nombre: string; rfc: string; }
interface Cliente { id: number; nombre: string; taxID?: string; }

interface Props {
  onFacturaCreada: () => void;
}

const conceptoVacio = (): ConceptoForm => ({ descripcion: '', cantidad: 1, precioUnitario: 0 });

export default function CrearFactura({ onFacturaCreada }: Props) {
  const [emisores, setEmisores] = useState<Emisor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formatos, setFormatos] = useState<Formato[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const [numeroFactura, setNumeroFactura] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [perfilEmisorID, setPerfilEmisorID] = useState('');
  const [clienteID, setClienteID] = useState('');
  const [formatoID, setFormatoID] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [ivaPorcentaje, setIvaPorcentaje] = useState(16);
  const [conceptos, setConceptos] = useState<ConceptoForm[]>([conceptoVacio()]);

  const formatoSeleccionado = formatos.find(f => f.id === Number(formatoID));
  const esExtranjero = formatoSeleccionado?.tipo === 2;

  // Ajusta IVA automáticamente según el tipo de formato
  useEffect(() => {
    if (formatoSeleccionado) {
      setIvaPorcentaje(esExtranjero ? 0 : 16);
    }
  }, [formatoID]);

  // Carga catálogos al montar
  useEffect(() => {
    async function cargar() {
      try {
        const [emisRes, cliRes, fmtRes] = await Promise.all([
          fetch(`${API_BASE}/emisores`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/clientes`, { headers: getAuthHeaders() }),
          formatoService.getAll(),
        ]);
        const emis = await emisRes.json();
        const clis = await cliRes.json();
        setEmisores(emis.map((e: any) => ({ id: e.id, nombre: e.nombre, rfc: e.rfc })));
        setClientes(clis.map((c: any) => ({ id: c.id, nombre: c.nombre, taxID: c.taxID })));
        setFormatos(fmtRes);
      } catch {
        setError('No se pudieron cargar los catálogos. Verifica la conexión con el servidor.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // Cálculos en tiempo real
  const subtotal = conceptos.reduce((acc, c) => acc + (c.cantidad || 0) * (c.precioUnitario || 0), 0);
  const ivaMonto = subtotal * (ivaPorcentaje / 100);
  const total = subtotal + ivaMonto;

  const updateConcepto = useCallback((idx: number, campo: keyof ConceptoForm, valor: string | number) => {
    setConceptos(prev => prev.map((c, i) => i === idx ? { ...c, [campo]: valor } : c));
  }, []);

  const agregarConcepto = () => setConceptos(prev => [...prev, conceptoVacio()]);

  const eliminarConcepto = (idx: number) => {
    if (conceptos.length === 1) return;
    setConceptos(prev => prev.filter((_, i) => i !== idx));
  };

  const validar = (): string => {
    if (!numeroFactura.trim()) return 'El número de factura es requerido.';
    if (!perfilEmisorID) return 'Selecciona un emisor.';
    if (!clienteID) return 'Selecciona un cliente.';
    if (!formatoID) return 'Selecciona un formato.';
    if (conceptos.some(c => !c.descripcion.trim())) return 'Todos los conceptos requieren descripción.';
    if (conceptos.some(c => c.precioUnitario <= 0)) return 'El precio unitario debe ser mayor a 0.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errMsg = validar();
    if (errMsg) { setError(errMsg); return; }
    setError('');
    setEnviando(true);
    try {
      const blob = await facturaService.crear({
        numeroFactura,
        fecha,
        perfilEmisorID: Number(perfilEmisorID),
        clienteID: Number(clienteID),
        formatoID: Number(formatoID),
        proyecto,
        ivaPorcentaje,
        conceptos,
      });
      descargarBlob(blob, `Factura_${numeroFactura}.pdf`);
      onFacturaCreada();
      // Reset form
      setNumeroFactura('');
      setProyecto('');
      setPerfilEmisorID('');
      setClienteID('');
      setFormatoID('');
      setConceptos([conceptoVacio()]);
    } catch (err: any) {
      setError(err.message || 'Error al generar la factura.');
    } finally {
      setEnviando(false);
    }
  };

  const labelTaxID = esExtranjero ? 'Tax ID' : 'RFC';

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-slate-400" size={32} />
        <span className="ml-3 text-slate-500">Cargando catálogos...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
        <FileText className="text-blue-400" size={20} />
        <h2 className="text-white font-bold text-lg">Nueva Factura</h2>
        {esExtranjero && (
          <span className="ml-auto text-xs font-semibold bg-blue-500 text-white px-2.5 py-1 rounded-full">
            INVOICE · USD · VAT {ivaPorcentaje}%
          </span>
        )}
        {!esExtranjero && formatoSeleccionado && (
          <span className="ml-auto text-xs font-semibold bg-green-600 text-white px-2.5 py-1 rounded-full">
            FACTURA · MXN · IVA 16%
          </span>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Fila 1: Número y Fecha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Número de Factura
            </label>
            <input
              type="text"
              value={numeroFactura}
              onChange={e => setNumeroFactura(e.target.value)}
              placeholder="Ej: 004"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Fila 2: Emisor, Cliente, Formato */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Emisor
            </label>
            <select
              value={perfilEmisorID}
              onChange={e => setPerfilEmisorID(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Selecciona emisor...</option>
              {emisores.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Cliente ({labelTaxID})
            </label>
            <select
              value={clienteID}
              onChange={e => setClienteID(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Selecciona cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Formato
            </label>
            <select
              value={formatoID}
              onChange={e => setFormatoID(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Selecciona formato...</option>
              {formatos.map(f => (
                <option key={f.id} value={f.id}>
                  {f.nombreFormato} ({f.tipo === 1 ? 'Nacional' : 'Extranjero'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Proyecto */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            {esExtranjero ? 'For (Project)' : 'Proyecto'}
          </label>
          <input
            type="text"
            value={proyecto}
            onChange={e => setProyecto(e.target.value)}
            placeholder={esExtranjero ? 'Project description...' : 'Descripción del proyecto...'}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* VAT editable — solo para facturas extranjeras */}
        {esExtranjero && (
          <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Tax Rate (VAT)</p>
              <p className="text-xs text-blue-500 mt-0.5">Ajusta el porcentaje de impuesto aplicable a esta factura.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={ivaPorcentaje}
                onChange={e => setIvaPorcentaje(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                className="w-20 border border-blue-300 rounded-lg px-3 py-1.5 text-sm text-right font-bold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <span className="text-blue-700 font-bold text-sm">%</span>
            </div>
          </div>
        )}

        {/* Tabla de Conceptos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              {esExtranjero ? 'Line Items' : 'Conceptos'}
            </h3>
            <button
              type="button"
              onClick={agregarConcepto}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
            >
              <PlusCircle size={16} />
              Agregar línea
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase w-1/2">
                    {esExtranjero ? 'Description' : 'Descripción'}
                  </th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase w-20">
                    {esExtranjero ? 'Qty' : 'Cant.'}
                  </th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase w-32">
                    {esExtranjero ? 'Unit Price' : 'Precio Unit.'}
                  </th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase w-32">
                    {esExtranjero ? 'Amount' : 'Subtotal'}
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {conceptos.map((c, idx) => {
                  const importe = (c.cantidad || 0) * (c.precioUnitario || 0);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={c.descripcion}
                          onChange={e => updateConcepto(idx, 'descripcion', e.target.value)}
                          placeholder={esExtranjero ? 'Service description...' : 'Descripción del servicio...'}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={c.cantidad}
                          onChange={e => updateConcepto(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={c.precioUnitario}
                          onChange={e => updateConcepto(idx, 'precioUnitario', parseFloat(e.target.value) || 0)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-700">
                        ${importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => eliminarConcepto(idx)}
                          disabled={conceptos.length === 1}
                          className="text-slate-300 hover:text-red-500 disabled:opacity-30 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales */}
        <div className="flex justify-end">
          <div className="w-72 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{esExtranjero ? 'Subtotal' : 'Subtotal'}</span>
              <span className="font-medium">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{esExtranjero ? `VAT (${ivaPorcentaje}%)` : `IVA (${ivaPorcentaje}%)`}</span>
              <span className="font-medium">${ivaMonto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-base border-t border-slate-200 pt-2 mt-2">
              <span>Total {esExtranjero ? 'USD' : 'MXN'}</span>
              <span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={enviando}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            {enviando ? (
              <><Loader2 size={16} className="animate-spin" /> Generando PDF...</>
            ) : (
              <><FileText size={16} /> Generar PDF</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
