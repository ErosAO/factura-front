import { useEffect, useState } from 'react';
import type { CreateUsuarioForm, UpdateUsuarioForm, Usuario } from '../../types/usuario';
import { ROLES } from '../../types/usuario';
import { usuarioService } from '../../services/usuarioService';

const ROL_BADGE: Record<string, string> = {
  Administracion: 'bg-purple-100 text-purple-800',
  Contador: 'bg-blue-100 text-blue-800',
  Usuario: 'bg-green-100 text-green-800',
};

const emptyCreate: CreateUsuarioForm = {
  nombreCompleto: '',
  email: '',
  password: '',
  rol: 'Usuario',
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal crear
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUsuarioForm>(emptyCreate);
  const [createError, setCreateError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Modal editar
  const [editUsuario, setEditUsuario] = useState<Usuario | null>(null);
  const [editForm, setEditForm] = useState<UpdateUsuarioForm>({ nombreCompleto: '', email: '', rol: 'Usuario' });
  const [editError, setEditError] = useState<string | null>(null);

  // Modal asignar rol
  const [rolUsuario, setRolUsuario] = useState<Usuario | null>(null);
  const [nuevoRol, setNuevoRol] = useState('');

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setGuardando(true);
    try {
      await usuarioService.create(createForm);
      setShowCreate(false);
      setCreateForm(emptyCreate);
      await cargarUsuarios();
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Error al crear usuario');
    } finally {
      setGuardando(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsuario) return;
    setEditError(null);
    setGuardando(true);
    try {
      await usuarioService.update(editUsuario.id, editForm);
      setEditUsuario(null);
      await cargarUsuarios();
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : 'Error al actualizar usuario');
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!window.confirm(`¿Eliminar a ${usuario.nombreCompleto}?`)) return;
    try {
      await usuarioService.delete(usuario.id);
      await cargarUsuarios();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
    }
  };

  const handleAsignarRol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rolUsuario) return;
    setGuardando(true);
    try {
      await usuarioService.asignarRol(rolUsuario.id, nuevoRol);
      setRolUsuario(null);
      await cargarUsuarios();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al asignar rol');
    } finally {
      setGuardando(false);
    }
  };

  const abrirEditar = (u: Usuario) => {
    setEditUsuario(u);
    setEditForm({ nombreCompleto: u.nombreCompleto, email: u.email, rol: u.rol });
    setEditError(null);
  };

  const abrirRol = (u: Usuario) => {
    setRolUsuario(u);
    setNuevoRol(u.rol || 'Usuario');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Usuarios</h1>
            <p className="text-slate-500 mt-1">Administra los usuarios y sus roles en el sistema.</p>
          </div>
          <button
            onClick={() => { setShowCreate(true); setCreateError(null); setCreateForm(emptyCreate); }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg shadow-md active:scale-95 transition-all"
          >
            + Nuevo Usuario
          </button>
        </header>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-lg">{error}</div>
        )}

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-100 uppercase text-xs tracking-wider">
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Correo</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-400">Cargando usuarios...</td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-400">No hay usuarios registrados.</td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{u.nombreCompleto}</td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${ROL_BADGE[u.rol] ?? 'bg-slate-100 text-slate-600'}`}>
                        {u.rol || 'Sin rol'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => abrirRol(u)}
                          className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all"
                        >
                          Rol
                        </button>
                        <button
                          onClick={() => abrirEditar(u)}
                          className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
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
      {showCreate && (
        <Modal titulo="Nuevo Usuario" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {createError && <ErrorBanner msg={createError} />}
            <Field label="Nombre Completo">
              <input required className={inputClass} value={createForm.nombreCompleto}
                onChange={e => setCreateForm({ ...createForm, nombreCompleto: e.target.value })} />
            </Field>
            <Field label="Correo Electrónico">
              <input required type="email" className={inputClass} value={createForm.email}
                onChange={e => setCreateForm({ ...createForm, email: e.target.value })} />
            </Field>
            <Field label="Contraseña">
              <input required type="password" className={inputClass} value={createForm.password}
                onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número" />
            </Field>
            <Field label="Rol">
              <select className={inputClass} value={createForm.rol}
                onChange={e => setCreateForm({ ...createForm, rol: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={guardando}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-all">
                {guardando ? 'Guardando...' : 'Crear Usuario'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Editar */}
      {editUsuario && (
        <Modal titulo="Editar Usuario" onClose={() => setEditUsuario(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            {editError && <ErrorBanner msg={editError} />}
            <Field label="Nombre Completo">
              <input required className={inputClass} value={editForm.nombreCompleto}
                onChange={e => setEditForm({ ...editForm, nombreCompleto: e.target.value })} />
            </Field>
            <Field label="Correo Electrónico">
              <input required type="email" className={inputClass} value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            </Field>
            <Field label="Rol">
              <select className={inputClass} value={editForm.rol}
                onChange={e => setEditForm({ ...editForm, rol: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={guardando}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-all">
                {guardando ? 'Guardando...' : 'Actualizar'}
              </button>
              <button type="button" onClick={() => setEditUsuario(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Asignar Rol */}
      {rolUsuario && (
        <Modal titulo={`Asignar Rol — ${rolUsuario.nombreCompleto}`} onClose={() => setRolUsuario(null)}>
          <form onSubmit={handleAsignarRol} className="space-y-4">
            <Field label="Rol">
              <select className={inputClass} value={nuevoRol} onChange={e => setNuevoRol(e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={guardando}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-all">
                {guardando ? 'Asignando...' : 'Asignar Rol'}
              </button>
              <button type="button" onClick={() => setRolUsuario(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const inputClass = 'w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm';

function Modal({ titulo, children, onClose }: { titulo: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{titulo}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm rounded">{msg}</div>;
}
