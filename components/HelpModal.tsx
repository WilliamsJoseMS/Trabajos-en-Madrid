import React from 'react';
import { X, HelpCircle, Clock, FileText } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Guía Rápida</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          
          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-amber-500" /> Estados de Pago
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tus trabajos inician como <span className="text-amber-400">Pendiente</span>. 
              Haz clic sobre la etiqueta de estado en la lista para cambiarlo a <span className="text-emerald-400">Pagado</span> cuando recibas el dinero.
            </p>
          </div>

          <div className="space-y-2">
             <h3 className="font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" /> Generar Recibos
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Usa el botón "Recibo" para crear un comprobante estilo ticket de caja. Puedes filtrar por mes o elegir un rango de fechas personalizado. ¡Ideal para enviar por WhatsApp!
            </p>
          </div>

           <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-500">
              * Los datos se guardan en tu navegador. Si borras el caché, podrías perder la información.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};