import { useState, useEffect } from 'react';
import { Download, Loader2, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { facturaService, descargarBlob } from '../../services/facturaService';
import type { FacturaListItem } from '../../types/factura';

interface Props {
  refreshKey: number;
}

export default function ListadoFacturas({ refreshKey }: Props) {
  const [facturas, setFacturas] = useState<FacturaListItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState<number | null>(null);

  useEffect(() => {
    setCargando(true);
    setError('');
    facturaService
      .getAll()
      .then(setFacturas)
      .catch(() => setError('No se pudo cargar el historial de facturas.'))
      .finally(() => setCargando(false));
  }, [refreshKey]);

  const handleRedescargar = async (factura: FacturaListItem) => {
    setDescargando(factura.facturaID);
    try {
      const blob = await facturaService.getPdf(factura.facturaID);
      descargarBlob(blob, `Factura_${factura.numeroFactura}.pdf`);
    } catch {
      alert('Error al regenerar el PDF de esta factura.');
    } finally {
      setDescargando(null);
    }
  };

  const formatFecha = (fechaStr: string) =>
    new Date(fechaStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
        <FileText className="text-slate-400" size={20} />
        <h2 className="text-white font-bold text-lg">Historial de Facturas</h2>
        {!cargando && (
          <span className="ml-auto text-xs text-slate-400 font-medium">
            {facturas.length} {facturas.length === 1 ? 'registro' : 'registros'}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border-b border-red-100 text-red-700 px-6 py-3 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {cargando ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-slate-400" size={28} />
          <span className="ml-3 text-slate-500 text-sm">Cargando historial...</span>
        </div>
      ) : facturas.length === 0 ? (
        <div className="py-20 text-center">
          <FileText className="mx-auto text-slate-300" size={48} />
          <p className="mt-4 text-slate-400 font-medium text-sm">No hay facturas registradas aún.</p>
          <p className="text-slate-300 text-xs mt-1">Usa el formulario de arriba para crear la primera.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Folio</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3 text-right">Subtotal</th>
                <th className="px-6 py-3 text-right">IVA</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-center">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facturas.map(f => (
                <tr key={f.facturaID} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800 text-sm">{f.numeroFactura}</span>
                    <p className="text-xs text-slate-400">{f.emisorNombre}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{f.clienteNombre}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatFecha(f.fecha)}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">
                    ${f.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    <span className="text-xs text-slate-400">{f.ivaPorcentaje}%</span>{' '}
                    ${f.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    ${f.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleRedescargar(f)}
                      disabled={descargando === f.facturaID}
                      title="Re-descargar PDF"
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                      {descargando === f.facturaID ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Download size={13} />
                      )}
                      <RefreshCw size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
