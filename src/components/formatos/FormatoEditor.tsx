import { useState, useCallback } from 'react';
import type { BloqueId, CreateFormatoForm, TipoFormato, UpdateFormatoForm } from '../../types/formato';
import {
  ALL_PLACEHOLDERS,
  BLOQUES_DISPONIBLES,
  REQUIRED_PLACEHOLDERS,
  TIPO_FORMATO_LABELS,
} from '../../types/formato';
import formatoNacional from '../../assets/formatostandardNacional.html?raw';
import formatoExtranjero from '../../assets/formatostandardExtranjero.html?raw';

type EditorMode = 'visual' | 'codigo';

interface FormatoEditorProps {
  titulo: string;
  initialData?: CreateFormatoForm | UpdateFormatoForm;
  onGuardar: (data: CreateFormatoForm | UpdateFormatoForm) => Promise<void>;
  onCancelar: () => void;
  guardando: boolean;
  error: string | null;
}

const DEFAULT_FORM: CreateFormatoForm = {
  nombreFormato: '',
  contenidoHTML: '',
  esEstandar: false,
  tipo: 1,
};

const STANDARD_TEMPLATES: Record<TipoFormato, string> = {
  1: formatoNacional,
  2: formatoExtranjero,
};

const WRAPPER_OPEN = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{font-family:Arial,sans-serif;padding:24px;max-width:800px;margin:auto;}
table{border-collapse:collapse;}th,td{padding:8px;}</style></head><body>`;
const WRAPPER_CLOSE = `</body></html>`;

export default function FormatoEditor({
  titulo,
  initialData,
  onGuardar,
  onCancelar,
  guardando,
  error,
}: FormatoEditorProps) {
  const [modo, setModo] = useState<EditorMode>('visual');
  const [form, setForm] = useState<CreateFormatoForm | UpdateFormatoForm>(
    initialData ?? DEFAULT_FORM
  );
  const [bloques, setBloques] = useState<BloqueId[]>([]);
  const [colorPrimario, setColorPrimario] = useState('#2c3e50');
  const [colorSecundario, setColorSecundario] = useState('#c0392b');
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [mostrarPlaceholders, setMostrarPlaceholders] = useState(false);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const generarHtmlDesdeBlques = useCallback(
    (bks: BloqueId[], cp = colorPrimario, cs = colorSecundario) => {
      return bks
        .map(id => BLOQUES_DISPONIBLES.find(b => b.id === id)?.html ?? '')
        .join('\n')
        .replace(/\{\{ColorPrimario\}\}/g, cp)
        .replace(/\{\{ColorSecundario\}\}/g, cs);
    },
    [colorPrimario, colorSecundario]
  );

  const validarPlaceholders = (html: string): string[] =>
    REQUIRED_PLACEHOLDERS.filter(p => !html.includes(p));

  // ── Modo Visual ──────────────────────────────────────────────────────────

  const handleAgregarBloque = (id: BloqueId) => {
    if (bloques.includes(id)) return;
    const nuevos = [...bloques, id];
    setBloques(nuevos);
    setForm(f => ({ ...f, contenidoHTML: generarHtmlDesdeBlques(nuevos) }));
    setValidationErrors([]);
  };

  const handleEliminarBloque = (id: BloqueId) => {
    const nuevos = bloques.filter(b => b !== id);
    setBloques(nuevos);
    setForm(f => ({ ...f, contenidoHTML: generarHtmlDesdeBlques(nuevos) }));
  };

  const handleMoverBloque = (desde: number, hacia: number) => {
    const nuevos = [...bloques];
    const [item] = nuevos.splice(desde, 1);
    nuevos.splice(hacia, 0, item);
    setBloques(nuevos);
    setForm(f => ({ ...f, contenidoHTML: generarHtmlDesdeBlques(nuevos) }));
  };

  const handleColorChange = (tipo: 'primario' | 'secundario', valor: string) => {
    const cp = tipo === 'primario' ? valor : colorPrimario;
    const cs = tipo === 'secundario' ? valor : colorSecundario;
    if (tipo === 'primario') setColorPrimario(valor);
    else setColorSecundario(valor);
    setForm(f => ({ ...f, contenidoHTML: generarHtmlDesdeBlques(bloques, cp, cs) }));
  };

  // ── Plantilla estándar ────────────────────────────────────────────────────

  const handleCargarPlantilla = () => {
    const html = STANDARD_TEMPLATES[form.tipo as TipoFormato];
    setForm(f => ({ ...f, contenidoHTML: html }));
    setBloques([]);
    setModo('codigo');
    setValidationErrors([]);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const faltantes = validarPlaceholders(form.contenidoHTML);
    if (faltantes.length > 0) {
      setValidationErrors(faltantes);
      return;
    }
    setValidationErrors([]);
    await onGuardar(form);
  };

  const previewHtml = form.contenidoHTML.startsWith('<!DOCTYPE')
    ? form.contenidoHTML
    : `${WRAPPER_OPEN}${form.contenidoHTML}${WRAPPER_CLOSE}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-6">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{titulo}</h2>
          <button onClick={onCancelar} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Errores de servidor */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm rounded">{error}</div>
          )}

          {/* Placeholders faltantes */}
          {validationErrors.length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-amber-800 text-sm rounded">
              <p className="font-semibold mb-1">Placeholders obligatorios faltantes:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {validationErrors.map(p => <li key={p}><code className="bg-amber-100 px-1 rounded">{p}</code></li>)}
              </ul>
            </div>
          )}

          {/* Nombre, Tipo y flag estándar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Nombre del Formato</label>
              <input
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={form.nombreFormato}
                onChange={e => setForm(f => ({ ...f, nombreFormato: e.target.value }))}
                placeholder="Ej: Formato Nacional Estándar"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Tipo</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={form.tipo}
                onChange={e => setForm(f => ({ ...f, tipo: Number(e.target.value) as TipoFormato }))}
              >
                {([1, 2] as TipoFormato[]).map(t => (
                  <option key={t} value={t}>{TIPO_FORMATO_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="esEstandar"
              type="checkbox"
              checked={form.esEstandar}
              onChange={e => setForm(f => ({ ...f, esEstandar: e.target.checked }))}
              className="rounded border-slate-300"
            />
            <label htmlFor="esEstandar" className="text-sm font-semibold text-slate-600">
              Marcar como formato estándar
            </label>
          </div>

          {/* Cargar plantilla + Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
              <button
                type="button"
                onClick={() => setModo('visual')}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  modo === 'visual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Editor Visual
              </button>
              <button
                type="button"
                onClick={() => setModo('codigo')}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  modo === 'codigo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Modo Código
              </button>
            </div>

            <button
              type="button"
              onClick={handleCargarPlantilla}
              className="px-4 py-1.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-all"
              title={`Carga el HTML estándar ${TIPO_FORMATO_LABELS[form.tipo as TipoFormato]}`}
            >
              Cargar plantilla {TIPO_FORMATO_LABELS[form.tipo as TipoFormato]}
            </button>
          </div>

          {/* ── Modo Visual ── */}
          {modo === 'visual' && (
            <div className="space-y-4">
              {/* Color pickers */}
              <div className="flex flex-wrap gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-slate-600">Color Primario</label>
                  <input
                    type="color"
                    value={colorPrimario}
                    onChange={e => handleColorChange('primario', e.target.value)}
                    className="h-8 w-12 rounded cursor-pointer border border-slate-300"
                  />
                  <span className="text-xs text-slate-500 font-mono">{colorPrimario}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-slate-600">Color Secundario</label>
                  <input
                    type="color"
                    value={colorSecundario}
                    onChange={e => handleColorChange('secundario', e.target.value)}
                    className="h-8 w-12 rounded cursor-pointer border border-slate-300"
                  />
                  <span className="text-xs text-slate-500 font-mono">{colorSecundario}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bloques disponibles */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Bloques disponibles</p>
                  <div className="space-y-2">
                    {BLOQUES_DISPONIBLES.map(bloque => (
                      <button
                        key={bloque.id}
                        type="button"
                        disabled={bloques.includes(bloque.id)}
                        onClick={() => handleAgregarBloque(bloque.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          bloques.includes(bloque.id)
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {bloques.includes(bloque.id) ? '✓ ' : '+ '}
                        {bloque.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Canvas — orden de bloques */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">
                    Diseño del formato
                    {bloques.length === 0 && (
                      <span className="text-slate-400 font-normal"> (agrega bloques desde la izquierda)</span>
                    )}
                  </p>
                  <div className="min-h-36 border-2 border-dashed border-slate-300 rounded-xl p-3 space-y-2 bg-slate-50">
                    {bloques.length === 0 && (
                      <p className="text-slate-400 text-sm text-center py-8">
                        O usa "Cargar plantilla" para partir del estándar
                      </p>
                    )}
                    {bloques.map((id, idx) => {
                      const bloque = BLOQUES_DISPONIBLES.find(b => b.id === id)!;
                      return (
                        <div
                          key={id}
                          draggable
                          onDragStart={e => e.dataTransfer.setData('text/plain', String(idx))}
                          onDragOver={e => { e.preventDefault(); setDragOver(idx); }}
                          onDrop={e => {
                            e.preventDefault();
                            handleMoverBloque(Number(e.dataTransfer.getData('text/plain')), idx);
                            setDragOver(null);
                          }}
                          onDragLeave={() => setDragOver(null)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border bg-white shadow-sm cursor-grab transition-all ${
                            dragOver === idx ? 'border-blue-400 bg-blue-50' : 'border-slate-200'
                          }`}
                        >
                          <span className="text-sm font-medium text-slate-700">
                            <span className="text-slate-400 mr-2">⠿</span>
                            {bloque.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEliminarBloque(id)}
                            className="text-red-400 hover:text-red-600 text-lg leading-none"
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Modo Código ── */}
          {modo === 'codigo' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-600">HTML del formato</label>
                <button
                  type="button"
                  onClick={() => setMostrarPlaceholders(v => !v)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  {mostrarPlaceholders ? 'Ocultar placeholders' : 'Ver placeholders disponibles'}
                </button>
              </div>

              {/* Referencia de placeholders */}
              {mostrarPlaceholders && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Placeholders disponibles
                    <span className="ml-2 text-amber-600 font-semibold normal-case">
                      Obligatorios: {REQUIRED_PLACEHOLDERS.join(', ')}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_PLACEHOLDERS.map(p => (
                      <button
                        key={p}
                        type="button"
                        title="Clic para copiar"
                        onClick={() => navigator.clipboard.writeText(p)}
                        className={`px-2 py-0.5 rounded text-xs font-mono transition-all hover:scale-105 ${
                          REQUIRED_PLACEHOLDERS.includes(p as typeof REQUIRED_PLACEHOLDERS[number])
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Clic en cualquier placeholder para copiarlo al portapapeles.</p>
                </div>
              )}

              <textarea
                className="w-full h-72 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs font-mono resize-y"
                value={form.contenidoHTML}
                onChange={e => { setForm(f => ({ ...f, contenidoHTML: e.target.value })); setValidationErrors([]); }}
                placeholder={`Pega tu HTML aquí o usa "Cargar plantilla ${TIPO_FORMATO_LABELS[form.tipo as TipoFormato]}" como punto de partida.`}
                spellCheck={false}
              />
            </div>
          )}

          {/* Previsualización en tiempo real */}
          {mostrarPreview && form.contenidoHTML && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-600">Previsualización</span>
                <button type="button" onClick={() => setMostrarPreview(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                  Cerrar
                </button>
              </div>
              <iframe
                srcDoc={previewHtml}
                className="w-full h-96 bg-white"
                title="Previsualización del formato"
                sandbox="allow-same-origin"
              />
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => setMostrarPreview(v => !v)}
              disabled={!form.contenidoHTML}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition-all"
            >
              {mostrarPreview ? 'Ocultar preview' : 'Vista previa'}
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-lg transition-all"
            >
              {guardando ? 'Guardando...' : 'Guardar Formato'}
            </button>
            <button
              type="button"
              onClick={onCancelar}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
