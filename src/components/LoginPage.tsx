import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const user = await authService.login(email, password);
      login(user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">FacturaSys</h1>
          <p className="text-slate-400 mt-1 text-sm">Sistema de Gestión de Facturas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-md active:scale-95 transition-all mt-2"
            >
              {cargando ? 'Iniciando sesión...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
