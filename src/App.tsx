import { useState } from 'react';
import UsuariosPage from './components/usuarios/UsuariosPage';
import FormatosPage from './components/formatos/FormatosPage';
import LoginPage from './components/LoginPage';
import CrearFactura from './components/facturas/CrearFactura';
import ListadoFacturas from './components/facturas/ListadoFacturas';
import { useAuth } from './context/AuthContext';

type Vista = 'facturas' | 'usuarios' | 'formatos';

const ROL_BADGE: Record<string, string> = {
  Administracion: 'bg-purple-500',
  Contador: 'bg-blue-500',
  Usuario: 'bg-green-500',
};

export default function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const [vista, setVista] = useState<Vista>('facturas');
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isAuthenticated) return <LoginPage />;

  const navItemClass = (v: Vista) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
      vista === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Barra de navegación */}
      <nav className="bg-slate-900 px-6 md:px-10 py-3 flex items-center gap-3">
        <span className="text-white font-extrabold text-lg mr-4 tracking-tight">FacturaSys</span>

        <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
          <button className={navItemClass('facturas')} onClick={() => setVista('facturas')}>
            Facturas
          </button>
          <button className={navItemClass('usuarios')} onClick={() => setVista('usuarios')}>
            Usuarios
          </button>
          <button className={navItemClass('formatos')} onClick={() => setVista('formatos')}>
            Formatos
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-semibold leading-tight">{user!.nombreCompleto}</p>
            <p className="text-slate-400 text-xs">{user!.email}</p>
          </div>
          <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${ROL_BADGE[user!.rol] ?? 'bg-slate-600'}`}>
            {user!.rol}
          </span>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-white text-sm font-semibold border border-slate-700 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-all"
          >
            Salir
          </button>
        </div>
      </nav>

      {/* Contenido */}
      {vista === 'usuarios' ? (
        <UsuariosPage />
      ) : vista === 'formatos' ? (
        <FormatosPage />
      ) : (
        <div className="p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
            <header className="text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Dashboard de Facturación
              </h1>
              <p className="text-slate-500 mt-2">Emite y gestiona tus comprobantes fiscales en tiempo real.</p>
            </header>

            <CrearFactura onFacturaCreada={() => setRefreshKey(k => k + 1)} />
            <ListadoFacturas refreshKey={refreshKey} />
          </div>
        </div>
      )}
    </div>
  );
}
