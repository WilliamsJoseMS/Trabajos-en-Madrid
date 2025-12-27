import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Home, 
  Euro, 
  Plus, 
  Clock, 
  CheckCircle, 
  Filter, 
  Trash2, 
  Receipt,
  Search
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { format, parseISO, startOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { WorkDay, Location, Status } from './types';
import { StatsCard } from './components/StatsCard';
import { AddEntryModal } from './components/AddEntryModal';
import { ReceiptGenerator } from './components/ReceiptGenerator';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'madrid_jobs_data_v1';

function App() {
  // --- State ---
  const [days, setDays] = useState<WorkDay[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'Todos' | Status>('Todos');
  const [defaultRate, setDefaultRate] = useState(100);

  // --- Effects ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDays(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse storage");
      }
    } else {
      // Empty initialization as requested "sin datos agregados"
      setDays([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
  }, [days]);

  // --- Logic & Calculations ---
  
  const handleAddDays = (newDays: WorkDay[]) => {
    const newDates = new Set(newDays.map(d => d.date));
    const cleanCurrentDays = days.filter(d => !newDates.has(d.date));
    const updated = [...cleanCurrentDays, ...newDays];
    // Update default rate based on last entry to be helpful
    if (newDays.length > 0) setDefaultRate(newDays[0].rate);
    setDays(updated.sort((a, b) => b.date.localeCompare(a.date)));
  };

  const toggleStatus = (id: string) => {
    setDays(prev => prev.map(d => 
      d.id === id 
        ? { ...d, status: d.status === Status.PENDING ? Status.PAID : Status.PENDING }
        : d
    ));
  };

  const deleteDay = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
      setDays(prev => prev.filter(d => d.id !== id));
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const totalPending = days.filter(d => d.status === Status.PENDING).reduce((acc, curr) => acc + curr.rate, 0);
    const totalPaid = days.filter(d => d.status === Status.PAID).reduce((acc, curr) => acc + curr.rate, 0);
    const totalDays = days.length;
    const homeDays = days.filter(d => d.location === Location.HOME).length;
    return { totalPending, totalPaid, totalDays, homeDays };
  }, [days]);

  // Filtered List
  const displayDays = useMemo(() => {
    return days.filter(d => filterStatus === 'Todos' || d.status === filterStatus);
  }, [days, filterStatus]);

  // Chart Data (Last 6 months revenue)
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStr = format(date, 'yyyy-MM');
      const label = format(date, 'MMM', { locale: es }); // Spanish month names
      const amount = days
        .filter(d => d.date.startsWith(monthStr))
        .reduce((sum, d) => sum + d.rate, 0);
      data.push({ name: label, income: amount });
    }
    return data;
  }, [days]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-20 md:pb-10">
      
      {/* Top Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Briefcase className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Madrid Jobs</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsReceiptModalOpen(true)}
                className="hidden md:flex items-center gap-2 bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Receipt size={16} />
                <span>Recibo</span>
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-indigo-900/20 transition-all active:scale-95"
              >
                <Plus size={18} />
                <span>Registrar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Pago Pendiente" 
            value={`€${stats.totalPending.toLocaleString()}`} 
            icon={Clock} 
            colorClass="bg-amber-600" 
            subtext="Por cobrar"
          />
          <StatsCard 
            title="Total Pagado" 
            value={`€${stats.totalPaid.toLocaleString()}`} 
            icon={CheckCircle} 
            colorClass="bg-emerald-600" 
            subtext="Ya recibido"
          />
          <StatsCard 
            title="Días Totales" 
            value={stats.totalDays.toString()} 
            icon={Briefcase} 
            colorClass="bg-blue-600" 
            subtext={`${stats.homeDays} desde Casa`}
          />
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hidden lg:block">
            <p className="text-gray-400 text-sm font-medium mb-4">Tendencia (6 Meses)</p>
            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#1f2937', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }} 
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#6366f1" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-white">Registro de Trabajo</h2>
              
              {/* Filters */}
              <div className="flex bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-700 w-fit">
                {(['Todos', Status.PENDING, Status.PAID] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === status ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
              {displayDays.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No hay registros con este filtro.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {displayDays.map((day) => (
                    <div key={day.id} className="p-4 hover:bg-gray-750 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${day.location === Location.HOME ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'}`}>
                          {day.location === Location.HOME ? <Home size={20} /> : <Briefcase size={20} />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-200 capitalize">{format(parseISO(day.date), 'EEEE, d MMMM, yyyy', { locale: es })}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <span className="bg-gray-700 px-2 py-0.5 rounded text-gray-300">{day.location}</span>
                            {day.notes && <span>• {day.notes}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-white">€{day.rate.toFixed(2)}</p>
                          <button 
                            onClick={() => toggleStatus(day.id)}
                            className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${day.status === Status.PAID ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900' : 'bg-amber-900/30 text-amber-400 border border-amber-900 hover:bg-amber-900/50'}`}
                          >
                            {day.status}
                          </button>
                        </div>
                        <button 
                          onClick={() => deleteDay(day.id)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats / Side Panel */}
          <div className="space-y-6">
            
            {/* Mobile-only visible Receipt button for better UX */}
            <div className="md:hidden bg-indigo-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-lg font-bold mb-2">¿Necesitas un ticket?</h3>
                 <p className="text-indigo-100 text-sm mb-4">Genera un recibo profesional para tus registros.</p>
                 <button 
                   onClick={() => setIsReceiptModalOpen(true)}
                   className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold w-full"
                 >
                   Generar Ticket
                 </button>
               </div>
               <Receipt className="absolute -bottom-4 -right-4 text-indigo-500 opacity-50 w-32 h-32" />
            </div>

            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
               <h3 className="font-bold text-white mb-4">Desglose por Ubicación</h3>
               <div className="h-48">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={[
                     { name: 'Casa', value: stats.homeDays, color: '#c084fc' },
                     { name: 'Empresa', value: stats.totalDays - stats.homeDays, color: '#60a5fa' }
                   ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                      <YAxis hide />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {
                          [{color: '#c084fc'}, {color: '#60a5fa'}].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))
                        }
                      </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-gray-900 text-white rounded-xl shadow-lg p-6 border border-indigo-800">
              <h3 className="font-bold mb-1">Consejo Pro</h3>
              <p className="text-indigo-200 text-sm">
                Usa el modo "Por Lotes" al registrar para añadir una semana entera de trabajo en segundos.
              </p>
            </div>
          </div>

        </div>
      </main>

      <AddEntryModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddDays}
        defaultRate={defaultRate}
      />

      <ReceiptGenerator 
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        allDays={days}
      />
    </div>
  );
}

export default App;