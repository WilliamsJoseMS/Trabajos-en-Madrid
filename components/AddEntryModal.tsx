import React, { useState } from 'react';
import { X, Calendar, Euro, Briefcase, Home } from 'lucide-react';
import { Location, Status, WorkDay } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (days: WorkDay[]) => void;
  defaultRate: number;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose, onSave, defaultRate }) => {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [rate, setRate] = useState(defaultRate.toString());
  const [location, setLocation] = useState<Location>(Location.OFFICE);
  const [status, setStatus] = useState<Status>(Status.PENDING);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDays: WorkDay[] = [];
    const numericRate = parseFloat(rate) || 0;

    if (mode === 'single') {
      newDays.push({
        id: uuidv4(),
        date,
        location,
        status,
        rate: numericRate,
        notes,
        createdAt: Date.now(),
      });
    } else {
      // Batch logic
      try {
        const range = eachDayOfInterval({
          start: parseISO(date),
          end: parseISO(endDate),
        });

        range.forEach((dayDate) => {
          newDays.push({
            id: uuidv4(),
            date: format(dayDate, 'yyyy-MM-dd'),
            location,
            status,
            rate: numericRate,
            notes,
            createdAt: Date.now(),
          });
        });
      } catch (err) {
        alert("Rango de fechas inválido");
        return;
      }
    }

    onSave(newDays);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900">
          <h2 className="text-xl font-bold text-white">Registrar Trabajo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Mode Selection */}
          <div className="flex bg-gray-700 p-1 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'single' ? 'bg-gray-600 shadow-sm text-white' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setMode('single')}
            >
              Día Único
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'batch' ? 'bg-gray-600 shadow-sm text-white' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setMode('batch')}
            >
              Por Lotes
            </button>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase">
                {mode === 'batch' ? 'Fecha Inicio' : 'Fecha'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                />
                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>

            {mode === 'batch' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase">Fecha Fin</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                  />
                  <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
              </div>
            )}
          </div>

          {/* Rate */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase">Tarifa Diaria (€)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                required
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
              />
              <Euro className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* Location & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase">Ubicación</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLocation(Location.OFFICE)}
                  className={`flex-1 py-2 flex items-center justify-center rounded-lg border transition-all ${location === Location.OFFICE ? 'border-indigo-500 bg-indigo-900/50 text-indigo-400' : 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                >
                  <Briefcase size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setLocation(Location.HOME)}
                  className={`flex-1 py-2 flex items-center justify-center rounded-lg border transition-all ${location === Location.HOME ? 'border-indigo-500 bg-indigo-900/50 text-indigo-400' : 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                >
                  <Home size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
               <label className="text-xs font-semibold text-gray-400 uppercase">Estado</label>
               <select
                 value={status}
                 onChange={(e) => setStatus(e.target.value as Status)}
                 className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
               >
                 <option value={Status.PENDING}>Pendiente</option>
                 <option value={Status.PAID}>Pagado</option>
               </select>
            </div>
          </div>

           <div className="space-y-1">
             <label className="text-xs font-semibold text-gray-400 uppercase">Notas (Opcional)</label>
             <textarea
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder-gray-400"
               rows={2}
               placeholder="Detalles del proyecto, extras, etc."
             />
           </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-900/50 transition-all transform active:scale-95"
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};