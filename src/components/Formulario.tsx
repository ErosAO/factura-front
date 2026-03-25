import { useState } from 'react';
import type { Factura } from '../types/factura';

interface Props {
  onAgregar: (nuevaFactura: Factura) => void;
}

export const Formulario = ({ onAgregar }: Props) => {
  const [folio, setFolio] = useState("");
  const [monto, setMonto] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folio || monto <= 0) return;

    onAgregar({
      id: crypto.randomUUID(), // Generamos un ID único (como un GUID en C#)
      folio,
      cliente: "Cliente Genérico",
      monto
    });

    setFolio(""); // Limpiamos campos
    setMonto(0);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded-lg mb-6">
      <input 
        className="border p-2 mr-2 rounded"
        placeholder="Folio"
        value={folio}
        onChange={(e) => setFolio(e.target.value)}
      />
      <input 
        className="border p-2 mr-2 rounded"
        type="number"
        value={monto}
        onChange={(e) => setMonto(Number(e.target.value))}
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded">Añadir</button>
    </form>
  );
};