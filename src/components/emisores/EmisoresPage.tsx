import { useEffect, useState } from 'react';
import { Building2, Pencil, Trash2, Plus, Search, X } from 'lucide-react';
import type { Emisor, CreateEmisorForm, UpdateEmisorForm } from '../../types/emisor';
import { REGIMENES_FISCALES } from '../../types/emisor';
import { emisorService } from '../../services/emisorService';

const emptyForm: CreateEmisorForm = {
  nombre: '',
  rfc: '',
  idCIF: '',
  direccionFiscal: '',
  regimenFiscal: '',
  bancoNombre: '',
  cuentaNumero: '',
  clabe: '',
  swiftCode: '',
};

// RFC mexicano: personas morales (12) o físicas (13)
const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;

export default function EmisoresPage() {
  const [emisores, setEmisores] = useState<Emisor[]>([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal crear
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateEmisorForm>(emptyForm);
  const [createError, setCreateError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Modal editar
  const [editEmisor, setEditEmisor] = useState<Emisor | null>(null);
  const [editForm, setEditForm] = useState<UpdateEmisorForm>(emptyForm);
  const [editError, setEditError] = useState<string | null>(null);

  const cargar = async () => {
    try {
      setCargando(true);
      setError(null);
      setEmisores(await emisorService.getAll());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar emisores');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const emisoresFiltrados = emisores.filter(e =>
    e.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (e.rfc ?? '').toLowerCase().includes(filtro.toLowerCase())
  );

  const validateRFC = (rfc: string) => RFC_REGEX.test(rfc);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRFC(createForm.rfc)) {
      setCreateError('RFC inválido. Formato esperado: 3-4 letras + 6 dígitos + 3 alfanuméricos.');
      return;
    }
    setCreateError(null);
    setGuardando(true);
    try {
      await emisorService.create(createForm);
      setShowCreate(false);
      setCreateForm(emptyForm);
      await cargar();
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Error al crear emisor');
    } finally {
      setGuardando(false);
    }
  };

  const abrirEditar = (em: Emisor) => {
    setEditEmisor(em);
    setEditForm({
      nombre: em.nombre,
      rfc: em.rfc,
      idCIF: em.idCIF ?? '',
      direccionFiscal: em.direccionFiscal ?? '',
      regimenFiscal: em.regimenFiscal ?? '',
      bancoNombre: em.bancoNombre ?? '',
      cuentaNumero: em.cuentaNumero ?? '',
      clabe: em.clabe ?? '',
      swiftCode: em.swiftCode ?? '',
    });
    setEditError(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmisor) return;
    if (!validateRFC(editForm.rfc)) {
      setEditError('RFC inválido. Formato esperado: 3-4 letras + 6 dígitos + 3 alfanuméricos.');
      return;
    }
    setEditError(null);
    setGuardando(true);
    try {
      await emisorService.update(editEmisor.id, editForm);
      setEditEmisor(null);
      await cargar();
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : 'Error al actualizar emisor');
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (em: Emisor) => {
    if (!window.confirm(`¿Eliminar el emisor "${em.nombre}"?`)) return;
    try {
      await emisorService.delete(em.id);
      await cargar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="text-blue-600" size={28} />
              Emisores
            </h1>
            <p className="text-slate-500 mt-1">Gestiona los perfiles fiscales emisores de facturas.</p>
          </div>
          <button
            onClick={() => { setShowCreate(true); setCreateError(null); setCreateForm(emptyForm); }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg shadow-md active:scale-95 transition-all"
          >
            <Plus size={16} /> Nuevo Emisor
          </button>
        </header>

        {/* Buscador */}
        <div className="mb-4 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            placeholder="Buscar por nombre o RFC…"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
          {filtro && (
            <button onClick={() => setFiltro('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        {error && <ErrorBanner msg={error} />}

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-slate-100 uppercase text-xs tracking-wider">
                <th className="p-4 font-semibold">Nombre / Razón Social</th>
                <th className="p-4 font-semibold">RFC</th>
                <th className="p-4 font-semibold hidden md:table-cell">Régimen Fiscal</th>
                <th className="p-4 font-semibold hidden lg:table-cell">Banco</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400">Cargando emisores...</td></tr>
              ) : emisoresFiltrados.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400">No hay emisores registrados.</td></tr>
              ) : emisoresFiltrados.map(em => (
                <tr key={em.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{em.nombre}</td>
                  <td className="p-4 font-mono text-slate-600">{em.rfc}</td>
                  <td className="p-4 text-slate-500 hidden md:table-cell">
                    {REGIMENES_FISCALES.find(r => r.codigo === em.regimenFiscal)?.descripcion ?? em.regimenFiscal ?? '—'}
                  </td>
                  <td className="p-4 text-slate-500 hidden lg:table-cell">{em.bancoNombre ?? '—'}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => abrirEditar(em)}
                        className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <Pencil size={12} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(em)}
                        className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear */}
      {showCreate && (
        <Modal titulo="Nuevo Emisor" onClose={() => setShowCreate(false)}>
          <EmisorForm
            form={createForm}
            onChange={setCreateForm}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            error={createError}
            guardando={guardando}
            submitLabel="Crear Emisor"
          />
        </Modal>
      )}

      {/* Modal Editar */}
      {editEmisor && (
        <Modal titulo={`Editar — ${editEmisor.nombre}`} onClose={() => setEditEmisor(null)}>
          <EmisorForm
            form={editForm}
            onChange={setEditForm}
            onSubmit={handleEdit}
            onCancel={() => setEditEmisor(null)}
            error={editError}
            guardando={guardando}
            submitLabel="Guardar Cambios"
          />
        </Modal>
      )}
    </div>
  );
}

// ─── Formulario de Emisor ─────────────────────────────────────────────────────

interface EmisorFormProps {
  form: CreateEmisorForm;
  onChange: (f: CreateEmisorForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  error: string | null;
  guardando: boolean;
  submitLabel: string;
}

function EmisorForm({ form, onChange, onSubmit, onCancel, error, guardando, submitLabel }: EmisorFormProps) {
  const set = (key: keyof CreateEmisorForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <ErrorBanner msg={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre / Razón Social *" className="sm:col-span-2">
          <input required className={inputClass} value={form.nombre} onChange={set('nombre')} />
        </Field>

        <Field label="RFC *">
          <input required className={inputClass} value={form.rfc}
            placeholder="XAXX010101000" maxLength={13} style={{ textTransform: 'uppercase' }}
            onChange={e => onChange({ ...form, rfc: e.target.value.toUpperCase() })} />
        </Field>

        <Field label="ID CIF">
          <input className={inputClass} value={form.idCIF} onChange={set('idCIF')} />
        </Field>

        <Field label="Dirección Fiscal" className="sm:col-span-2">
          <input className={inputClass} value={form.direccionFiscal} onChange={set('direccionFiscal')} />
        </Field>

        <Field label="Régimen Fiscal (SAT)" className="sm:col-span-2">
          <select className={inputClass} value={form.regimenFiscal} onChange={set('regimenFiscal')}>
            <option value="">— Seleccionar —</option>
            {REGIMENES_FISCALES.map(r => (
              <option key={r.codigo} value={r.codigo}>{r.descripcion}</option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2 border-t border-slate-100 pt-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Datos Bancarios</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Banco">
              <input className={inputClass} value={form.bancoNombre} onChange={set('bancoNombre')} />
            </Field>
            <Field label="Número de Cuenta">
              <input className={inputClass} value={form.cuentaNumero} onChange={set('cuentaNumero')} />
            </Field>
            <Field label="CLABE Interbancaria">
              <input className={inputClass} value={form.clabe} onChange={set('clabe')} maxLength={18} />
            </Field>
            <Field label="SWIFT Code">
              <input className={inputClass} value={form.swiftCode} onChange={set('swiftCode')}
                placeholder="Para transferencias internacionales" />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={guardando}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-all">
          {guardando ? 'Guardando...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg transition-all">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const inputClass = 'w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm';

function Modal({ titulo, children, onClose }: { titulo: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{titulo}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm rounded">{msg}</div>;
}
