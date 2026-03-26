import { useEffect, useState } from 'react';
import { Users, Pencil, Trash2, Plus, Search, X, Globe, MapPin } from 'lucide-react';
import type { Cliente, CreateClienteForm, UpdateClienteForm } from '../../types/cliente';
import { TIPOS_CLIENTE, RFC_NACIONAL_REGEX } from '../../types/cliente';
import { clienteService } from '../../services/clienteService';

const emptyForm: CreateClienteForm = {
  nombre: '',
  taxID: '',
  direccion: '',
  correoContacto: '',
  tipo: 1,
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal crear
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateClienteForm>(emptyForm);
  const [createError, setCreateError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Modal editar
  const [editCliente, setEditCliente] = useState<Cliente | null>(null);
  const [editForm, setEditForm] = useState<UpdateClienteForm>(emptyForm);
  const [editError, setEditError] = useState<string | null>(null);

  const cargar = async () => {
    try {
      setCargando(true);
      setError(null);
      setClientes(await clienteService.getAll());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar clientes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (c.taxID ?? '').toLowerCase().includes(filtro.toLowerCase())
  );

  const validateTaxID = (taxID: string, tipo: number): string | null => {
    if (!taxID) return null; // opcional
    if (tipo === 1 && !RFC_NACIONAL_REGEX.test(taxID))
      return 'RFC inválido. Formato: 3-4 letras + 6 dígitos + 3 alfanuméricos (ej. XAXX010101000).';
    return null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const taxErr = validateTaxID(createForm.taxID, createForm.tipo);
    if (taxErr) { setCreateError(taxErr); return; }
    setCreateError(null);
    setGuardando(true);
    try {
      await clienteService.create(createForm);
      setShowCreate(false);
      setCreateForm(emptyForm);
      await cargar();
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Error al crear cliente');
    } finally {
      setGuardando(false);
    }
  };

  const abrirEditar = (c: Cliente) => {
    setEditCliente(c);
    setEditForm({
      nombre: c.nombre,
      taxID: c.taxID ?? '',
      direccion: c.direccion ?? '',
      correoContacto: c.correoContacto ?? '',
      tipo: c.tipo,
    });
    setEditError(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCliente) return;
    const taxErr = validateTaxID(editForm.taxID, editForm.tipo);
    if (taxErr) { setEditError(taxErr); return; }
    setEditError(null);
    setGuardando(true);
    try {
      await clienteService.update(editCliente.id, editForm);
      setEditCliente(null);
      await cargar();
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : 'Error al actualizar cliente');
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (c: Cliente) => {
    if (!window.confirm(`¿Eliminar al cliente "${c.nombre}"?`)) return;
    try {
      await clienteService.delete(c.id);
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
              <Users className="text-emerald-600" size={28} />
              Clientes
            </h1>
            <p className="text-slate-500 mt-1">Gestiona los clientes nacionales y extranjeros.</p>
          </div>
          <button
            onClick={() => { setShowCreate(true); setCreateError(null); setCreateForm(emptyForm); }}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg shadow-md active:scale-95 transition-all"
          >
            <Plus size={16} /> Nuevo Cliente
          </button>
        </header>

        {/* Buscador */}
        <div className="mb-4 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
            placeholder="Buscar por nombre o RFC/Tax ID…"
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
                <th className="p-4 font-semibold">Razón Social</th>
                <th className="p-4 font-semibold">RFC / Tax ID</th>
                <th className="p-4 font-semibold hidden md:table-cell">Correo</th>
                <th className="p-4 font-semibold hidden sm:table-cell">Tipo</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400">Cargando clientes...</td></tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400">No hay clientes registrados.</td></tr>
              ) : clientesFiltrados.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{c.nombre}</td>
                  <td className="p-4 font-mono text-slate-600">{c.taxID ?? '—'}</td>
                  <td className="p-4 text-slate-500 hidden md:table-cell">{c.correoContacto ?? '—'}</td>
                  <td className="p-4 hidden sm:table-cell">
                    <TipoBadge tipo={c.tipo} />
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => abrirEditar(c)}
                        className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <Pencil size={12} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
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
        <Modal titulo="Nuevo Cliente" onClose={() => setShowCreate(false)}>
          <ClienteForm
            form={createForm}
            onChange={setCreateForm}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            error={createError}
            guardando={guardando}
            submitLabel="Crear Cliente"
          />
        </Modal>
      )}

      {/* Modal Editar */}
      {editCliente && (
        <Modal titulo={`Editar — ${editCliente.nombre}`} onClose={() => setEditCliente(null)}>
          <ClienteForm
            form={editForm}
            onChange={setEditForm}
            onSubmit={handleEdit}
            onCancel={() => setEditCliente(null)}
            error={editError}
            guardando={guardando}
            submitLabel="Guardar Cambios"
          />
        </Modal>
      )}
    </div>
  );
}

// ─── Formulario de Cliente ────────────────────────────────────────────────────

interface ClienteFormProps {
  form: CreateClienteForm;
  onChange: (f: CreateClienteForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  error: string | null;
  guardando: boolean;
  submitLabel: string;
}

function ClienteForm({ form, onChange, onSubmit, onCancel, error, guardando, submitLabel }: ClienteFormProps) {
  const set = (key: keyof CreateClienteForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...form, [key]: key === 'tipo' ? Number(e.target.value) : e.target.value });

  const esNacional = form.tipo === 1;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <ErrorBanner msg={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Razón Social *" className="sm:col-span-2">
          <input required className={inputClass} value={form.nombre} onChange={set('nombre')} />
        </Field>

        <Field label="Tipo de Cliente">
          <select className={inputClass} value={form.tipo} onChange={set('tipo')}>
            {TIPOS_CLIENTE.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        <Field label={esNacional ? 'RFC' : 'Tax ID'}>
          <input
            className={inputClass}
            value={form.taxID}
            placeholder={esNacional ? 'XAXX010101000' : 'Alfanumérico'}
            onChange={e => onChange({ ...form, taxID: esNacional ? e.target.value.toUpperCase() : e.target.value })}
          />
          {esNacional && (
            <p className="text-xs text-slate-400 mt-1">Formato: 3-4 letras + 6 dígitos + 3 alfanuméricos</p>
          )}
        </Field>

        <Field label="Correo Electrónico" className="sm:col-span-2">
          <input type="email" className={inputClass} value={form.correoContacto} onChange={set('correoContacto')} />
        </Field>

        <Field label="Dirección" className="sm:col-span-2">
          <input className={inputClass} value={form.direccion} onChange={set('direccion')} />
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={guardando}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-all">
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

function TipoBadge({ tipo }: { tipo: number }) {
  return tipo === 2 ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700">
      <Globe size={10} /> Extranjero
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
      <MapPin size={10} /> Nacional
    </span>
  );
}

const inputClass = 'w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-sm';

function Modal({ titulo, children, onClose }: { titulo: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
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
