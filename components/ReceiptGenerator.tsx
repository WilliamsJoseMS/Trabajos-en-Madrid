import React, { useState, useRef } from 'react';
import { X, Download, Filter, CalendarDays, Ticket } from 'lucide-react';
import { WorkDay, Status, Location } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import html2canvas from 'html2canvas';

interface ReceiptGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  allDays: WorkDay[];
}

export const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ isOpen, onClose, allDays }) => {
  const [filterType, setFilterType] = useState<'month' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Filter Logic
  const getFilteredDays = () => {
    return allDays.filter(day => {
      const dayDate = parseISO(day.date);
      if (filterType === 'month') {
        return format(dayDate, 'yyyy-MM') === selectedMonth;
      } else {
        return isWithinInterval(dayDate, {
          start: parseISO(startDate),
          end: parseISO(endDate)
        });
      }
    }).sort((a, b) => a.date.localeCompare(b.date));
  };

  const filteredDays = getFilteredDays();
  const totalAmount = filteredDays.reduce((sum, day) => sum + day.rate, 0);
  const totalDays = filteredDays.length;
  
  // Group by status for summary
  const pendingAmount = filteredDays.filter(d => d.status === Status.PENDING).reduce((sum, d) => sum + d.rate, 0);
  const paidAmount = filteredDays.filter(d => d.status === Status.PAID).reduce((sum, d) => sum + d.rate, 0);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: null, // Transparent to handle the css background
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Recibo_${filterType === 'month' ? selectedMonth : `${startDate}_a_${endDate}`}.png`;
      link.click();
    } catch (error) {
      console.error("Error generating receipt", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Ticket className="text-indigo-500" />
            <h2 className="text-lg font-bold text-white">Generar Ticket</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Controls Sidebar */}
          <div className="w-full md:w-80 bg-gray-800 p-6 border-r border-gray-700 flex flex-col gap-6 overflow-y-auto">
            
            <div>
              <label className="text-sm font-semibold text-gray-400 uppercase mb-2 block">Filtrar Por</label>
              <div className="flex bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => setFilterType('month')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${filterType === 'month' ? 'bg-gray-600 shadow text-white' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  Mes
                </button>
                <button
                  onClick={() => setFilterType('range')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${filterType === 'range' ? 'bg-gray-600 shadow text-white' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  Rango
                </button>
              </div>
            </div>

            {filterType === 'month' ? (
               <div>
                <label className="text-sm font-semibold text-gray-400 uppercase mb-2 block">Seleccionar Mes</label>
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
               </div>
            ) : (
              <div className="space-y-4">
                 <div>
                  <label className="text-sm font-semibold text-gray-400 uppercase mb-2 block">Fecha Inicio</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                 </div>
                 <div>
                  <label className="text-sm font-semibold text-gray-400 uppercase mb-2 block">Fecha Fin</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                 </div>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-gray-700">
               <div className="text-sm text-gray-400 mb-4 flex justify-between">
                 <span>Entradas:</span>
                 <span className="font-bold text-white">{filteredDays.length}</span>
               </div>
               <button
                onClick={handleDownload}
                disabled={filteredDays.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 disabled:bg-gray-600 disabled:text-gray-400 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/20"
               >
                 <Download size={18} />
                 Descargar PNG
               </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-950 p-8 overflow-y-auto flex justify-center items-start">
            
            {/* The Actual Receipt Container - Keeping white for thermal paper look */}
            <div 
              ref={receiptRef}
              className="bg-white w-[380px] min-h-[500px] shadow-2xl p-6 relative font-mono text-gray-900"
              style={{ 
                backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }}
            >
              {/* Receipt Visuals */}
              <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">Madrid Jobs</h1>
                <p className="text-xs text-gray-500 uppercase">Resumen de Trabajo</p>
                <p className="text-xs text-gray-400 mt-2">{format(new Date(), 'dd/MM/yyyy hh:mm a')}</p>
              </div>

              <div className="mb-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span>Período:</span>
                  <span className="font-bold text-right">
                    {filterType === 'month' ? selectedMonth : `${startDate} / ${endDate}`}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Días Totales:</span>
                  <span className="font-bold">{totalDays}</span>
                </div>
              </div>

              <div className="border-b-2 border-dashed border-gray-300 mb-4"></div>

              {/* Items List */}
              <div className="space-y-2 mb-6 text-sm">
                <div className="grid grid-cols-4 text-xs font-bold text-gray-500 uppercase mb-2">
                  <span className="col-span-1">Fecha</span>
                  <span className="col-span-1 text-center">Lug</span>
                  <span className="col-span-1 text-center">Est</span>
                  <span className="col-span-1 text-right">Cant</span>
                </div>
                {filteredDays.map((day) => (
                  <div key={day.id} className="grid grid-cols-4 items-center">
                    <span className="col-span-1">{format(parseISO(day.date), 'dd/MM')}</span>
                    <span className="col-span-1 text-center text-xs">
                      {day.location === Location.HOME ? 'Casa' : (day.location === Location.OFFICE ? 'Ofic' : 'Otro')}
                    </span>
                    <span className="col-span-1 text-center text-xs">
                       {day.status === Status.PAID ? 'OK' : 'PDT'}
                    </span>
                    <span className="col-span-1 text-right">€{day.rate.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-b-2 border-dashed border-gray-300 mb-4"></div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Pendiente (PDT):</span>
                  <span>€{pendingAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Pagado (OK):</span>
                  <span>€{paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold mt-4 pt-2 border-t-2 border-gray-900">
                  <span>TOTAL</span>
                  <span>€{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-gray-400">¡Gracias por tu trabajo!</p>
                <div className="mt-4">
                  {/* Fake Barcode */}
                  <div className="h-10 bg-gray-900 w-2/3 mx-auto"></div>
                  <p className="text-[10px] tracking-[0.5em] mt-1 text-gray-500">FIN-TICKET</p>
                </div>
              </div>
              
              {/* Zigzag Bottom Edge */}
              <div 
                 className="absolute bottom-[-10px] left-0 w-full h-[10px]"
                 style={{
                   background: 'linear-gradient(45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%)',
                   backgroundSize: '20px 40px',
                   backgroundPosition: '0 -20px'
                 }}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};