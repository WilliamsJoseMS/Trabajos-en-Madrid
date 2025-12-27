import React, { useState } from 'react';
import { X, Sparkles, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { WorkDay } from '../types';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: WorkDay[];
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen, onClose, days }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare data for the model (simplified to save tokens and focus on content)
      const dataSummary = days.map(d => ({
        date: d.date,
        location: d.location,
        status: d.status,
        amount: d.rate
      }));

      const prompt = `
        Actúa como un asistente financiero experto y amigable para esta aplicación de "Control de Trabajos en Madrid".
        
        Analiza los siguientes datos de trabajo (formato JSON):
        ${JSON.stringify(dataSummary)}
        
        Por favor, proporciona un reporte breve en Español que incluya:
        1. 💰 **Resumen Financiero**: Total ganado histórico y promedio por trabajo.
        2. 📅 **Patrones**: Días de la semana más trabajados o tendencias mensuales.
        3. 💡 **Consejos**: Sugerencias breves para mejorar la organización o ingresos basado en los datos (ej. si hay muchos pagos pendientes).
        4. Una frase motivadora final.

        Usa formato Markdown para que se vea bonito (negritas, listas), pero mantén la respuesta concisa.
      `;

      const response = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          setAnalysis(prev => prev + text);
        }
      }

    } catch (err: any) {
      console.error(err);
      setError("Error al conectar con Gemini. Asegúrate de haber configurado tu API KEY correctamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-gray-800 animate-fade-in">
        {/* Header */}
        <div className="bg-gray-800 p-6 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600/20 p-2 rounded-lg">
              <Sparkles className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Asistente IA</h2>
              <p className="text-xs text-purple-400">Potenciado por Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-950">
          {!analysis && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-80">
              <Bot size={64} className="text-gray-700" />
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-medium text-gray-300">¿Listo para analizar tus ingresos?</h3>
                <p className="text-sm text-gray-500">
                  La IA analizará tus {days.length} registros para darte estadísticas, tendencias y consejos financieros personalizados.
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={days.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-purple-900/40 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {days.length === 0 ? 'Sin datos para analizar' : 'Generar Análisis'}
              </button>
            </div>
          )}

          {loading && !analysis && (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-purple-500" size={40} />
              <p className="text-gray-400 animate-pulse">Consultando con Gemini...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-xl text-center">
              <p>{error}</p>
              <button 
                onClick={handleAnalyze}
                className="mt-3 text-sm font-bold underline hover:text-white"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {analysis && (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                {analysis}
              </div>
            </div>
          )}
        </div>

        {/* Footer (only visible when analysis is present) */}
        {analysis && !loading && (
          <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-end">
            <button
              onClick={handleAnalyze}
              className="text-sm text-purple-400 hover:text-purple-300 font-medium px-4 py-2"
            >
              Actualizar Análisis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};