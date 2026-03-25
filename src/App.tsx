// // 1. Importamos la herramienta para manejar el estado
// import { useState } from 'react';

// function App() {
//   // 2. Definimos el estado: 
//   // 'mensaje' es el valor actual. 'setMensaje' es la función para cambiarlo.
//   const [mensaje, setMensaje] = useState("Esperando clic...");

//   // 3. Una función lógica (como un método en C#)
//   const manejarClic = () => {
//     setMensaje("¡Botón presionado con éxito!");
//   };

//   // 4. Lo que se verá en pantalla (JSX)
//   return (
//     <div style={{ textAlign: 'center', marginTop: '50px' }}>
//       <h1>Mi primer Dashboard</h1>
//       <p>Estado actual: <strong>{mensaje}</strong></p>
      
//       {/* Evento onClick: nota que no lleva paréntesis para no ejecutarse al cargar */}
//       <button onClick={manejarClic}>
//         Actualizar Estado
//       </button>
//     </div>
//   );
// }

// export default App;

// import { useState, useEffect } from 'react';

// function App() {
//   const [data, setData] = useState<string | null>(null);
//   const [cargando, setCargando] = useState(true);

//   useEffect(() => {
//     // Simulamos una llamada a una API de AWS
//     setTimeout(() => {
//       setData("Factura #502 - AWS Services");
//       setCargando(false);
//     }, 3000); // Tarda 3 segundos
//   }, []); // Solo se ejecuta al iniciar

//   if (cargando) {
//     return <h1>Cargando datos del servidor...</h1>;
//   }

//   return (
//     <div>
//       <h1>Panel de Control</h1>
//       <p>Resultado: {data}</p>
//     </div>
//   );
// }

// export default App;

// import { useState } from 'react';

// export const FormularioFactura = () => {
//   const [folio, setFolio] = useState("");

//   const enviarDatos = (e: React.FormEvent) => {
//     e.preventDefault(); // Evita que la página se recargue (comportamiento por defecto de HTML)
//     console.log("Enviando a la API de .NET el folio:", folio);
//   };

//   return (
//     <form onSubmit={enviarDatos}>
//       <label>Folio de Factura:</label>
//       <input 
//         type="text" 
//         value={folio} // El valor viene del estado
//         onChange={(e) => setFolio(e.target.value)} // Actualizamos el estado al escribir
//         placeholder="Ej: FAC-123"
//       />
//       <button type="submit">Guardar</button>
      
//       <p>Lo que estás escribiendo: {folio}</p>
//     </form>
//   );
// }
// export default FormularioFactura;

// import { useState } from 'react';

// interface Factura {
//   folio: string;
//   cliente: string;
//   monto: number;
// }

// const FormularioFactura = () => {
//   const [factura, setFactura] = useState<Factura>({
//     folio: "",
//     cliente: "",
//     monto: 0
//   });

//   // Estado para manejar mensajes de error
//   const [error, setError] = useState<string | null>(null);

//   const enviarDatos = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Validación antes de "enviar"
//     if (factura.folio.length < 3) {
//       setError("El folio debe tener al menos 3 caracteres");
//       return;
//     }
//     if (factura.monto <= 0) {
//       setError("El monto no puede ser 0 o negativo");
//       return;
//     }

//     setError(null); // Si llega aquí, todo está bien
//     console.log("Datos listos para enviar a .NET:", factura);
//     alert("¡Factura enviada al servidor!");
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
//       <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-slate-100">
//         <h2 className="text-2xl font-bold text-slate-800 mb-6">Generador de Facturas</h2>
        
//         <form onSubmit={enviarDatos} className="space-y-5">
//           {/* Mostrar error si existe */}
//           {error && (
//             <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm animate-pulse">
//                {error}
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-semibold text-slate-600 mb-1">Folio</label>
//             <input 
//               type="text" 
//               className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
//               value={factura.folio}
//               onChange={(e) => setFactura({...factura, folio: e.target.value})}
//               placeholder="Ej: FAC-2026"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-slate-600 mb-1">Monto Total</label>
//             <input 
//               type="number" 
//               className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
//               value={factura.monto}
//               onChange={(e) => setFactura({...factura, monto: Number(e.target.value)})}
//             />
//           </div>

//           <button 
//             type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transform active:scale-95 transition-all"
//           >
//             Registrar Factura
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default FormularioFactura;

import { useState } from 'react';
import type { Factura } from './types/factura';
import { Formulario } from './components/Formulario';

export default function App() {
  const [listaFacturas, setListaFacturas] = useState<Factura[]>([]);

  const agregarFactura = (nueva: Factura) => {
    setListaFacturas([...listaFacturas, nueva]);
  };

  const eliminarFactura = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta factura?")) {
      setListaFacturas(listaFacturas.filter(f => f.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
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
  );
}