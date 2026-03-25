import { useState } from 'react';
import type { Factura } from './types/factura';
import { Formulario } from './components/Formulario';
import UsuariosPage from './components/usuarios/UsuariosPage';

type Vista = 'facturas' | 'usuarios';

export default function App() {
  const [vista, setVista] = useState<Vista>('facturas');
  const [listaFacturas, setListaFacturas] = useState<Factura[]>([]);

  const agregarFactura = (nueva: Factura) => {
    setListaFacturas([...listaFacturas, nueva]);
  };

  const eliminarFactura = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta factura?')) {
      setListaFacturas(listaFacturas.filter(f => f.id !== id));
    }
  };

  const navItemClass = (v: Vista) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
      vista === v
        ? 'bg-white text-slate-900 shadow-sm'
        : 'text-slate-400 hover:text-slate-700'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Barra de navegación */}
      <nav className="bg-slate-900 px-6 md:px-12 py-3 flex items-center gap-2">
        <span className="text-white font-extrabold text-lg mr-6 tracking-tight">FacturaSys</span>
        <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
          <button className={navItemClass('facturas')} onClick={() => setVista('facturas')}>
            Facturas
          </button>
          <button className={navItemClass('usuarios')} onClick={() => setVista('usuarios')}>
            Usuarios
          </button>
        </div>
      </nav>

      {/* Contenido */}
      {vista === 'usuarios' ? (
        <UsuariosPage />
      ) : (
        <div className="p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <header className="mb-10 text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Dashboard de Facturación
              </h1>
              <p className="text-slate-500 mt-2">Gestiona tus comprobantes fiscales en tiempo real.</p>
            </header>

            <Formulario onAgregar={agregarFactura} />

            <div className="mt-8 bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-100 uppercase text-xs tracking-wider">
                    <th className="p-5 font-semibold">Folio</th>
                    <th className="p-5 font-semibold">Monto</th>
                    <th className="p-5 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {listaFacturas.map((f) => (
                    <tr key={f.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="p-5 text-slate-700 font-medium">{f.folio}</td>
                      <td className="p-5 text-slate-900 font-bold">${f.monto.toLocaleString()}</td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() => eliminarFactura(f.id)}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {listaFacturas.length === 0 && (
                <div className="py-20 text-center">
                  <span className="text-5xl">📄</span>
                  <p className="mt-4 text-slate-400 font-medium">No hay facturas en el sistema.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
