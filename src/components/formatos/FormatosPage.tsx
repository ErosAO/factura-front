import { useEffect, useState } from 'react';
import type { CreateFormatoForm, Formato, UpdateFormatoForm } from '../../types/formato';
import { TIPO_FORMATO_LABELS } from '../../types/formato';
import { formatoService } from '../../services/formatoService';
import FormatoEditor from './FormatoEditor';

type ModalState =
  | { tipo: 'ninguno' }
  | { tipo: 'crear' }
  | { tipo: 'editar'; formato: Formato };

export default function FormatosPage() {
  const [formatos, setFormatos] = useState<Formato[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ tipo: 'ninguno' });
  const [editorError, setEditorError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargarFormatos = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await formatoService.getAll();
      setFormatos(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarFormatos(); }, []);

  const handleCrear = async (data: CreateFormatoForm | UpdateFormatoForm) => {
    setEditorError(null);
    setGuardando(true);
    try {
      await formatoService.create(data as CreateFormatoForm);
      setModal({ tipo: 'ninguno' });
      await cargarFormatos();
    } catch (e: unknown) {
      setEditorError(e instanceof Error ? e.message : 'Error al crear formato');
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = async (data: CreateFormatoForm | UpdateFormatoForm) => {
    if (modal.tipo !== 'editar') return;
    setEditorError(null);
    setGuardando(true);
    try {
      await formatoService.update(modal.formato.id, data as UpdateFormatoForm);
      setModal({ tipo: 'ninguno' });
      await cargarFormatos();
    } catch (e: unknown) {
      setEditorError(e instanceof Error ? e.message : 'Error al actualizar formato');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (formato: Formato) => {
    if (!window.confirm(`¿Eliminar el formato "${formato.nombreFormato}"?`)) return;
    try {
      await formatoService.delete(formato.id);
      await cargarFormatos();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al eliminar formato');
    }
  };

  const abrirEditar = (formato: Formato) => {
    setEditorError(null);
    setModal({ tipo: 'editar', formato });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Formatos de Facturación
            </h1>
            <p className="text-slate-500 mt-1">
              Administra las plantillas HTML para tus facturas.
            </p>
          </div>
          <button
            onClick={() => { setEditorError(null); setModal({ tipo: 'crear' }); }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg shadow-md active:scale-95 transition-all"
          >
            + Nuevo Formato
          </button>
        </header>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-100 uppercase text-xs tracking-wider">
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Tipo</th>
                <th className="p-4 font-semibold text-center">Estándar</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-400">
                    Cargando formatos...
                  </td>
                </tr>
              ) : formatos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-400">
                    No hay formatos registrados.
                  </td>
                </tr>
              ) : (
                formatos.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{f.nombreFormato}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        f.tipo === 1
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {TIPO_FORMATO_LABELS[f.tipo]}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {f.esEstandar ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                          Estándar
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => abrirEditar(f)}
                          className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(f)}
                          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-all"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear */}
      {modal.tipo === 'crear' && (
        <FormatoEditor
          titulo="Nuevo Formato"
          onGuardar={handleCrear}
          onCancelar={() => setModal({ tipo: 'ninguno' })}
          guardando={guardando}
          error={editorError}
        />
      )}

      {/* Modal Editar */}
      {modal.tipo === 'editar' && (
        <FormatoEditor
          titulo={`Editar: ${modal.formato.nombreFormato}`}
          initialData={{
            nombreFormato: modal.formato.nombreFormato,
            contenidoHTML: modal.formato.contenidoHTML,
            esEstandar: modal.formato.esEstandar,
            tipo: modal.formato.tipo,
          }}
          onGuardar={handleEditar}
          onCancelar={() => setModal({ tipo: 'ninguno' })}
          guardando={guardando}
          error={editorError}
        />
      )}
    </div>
  );
}
