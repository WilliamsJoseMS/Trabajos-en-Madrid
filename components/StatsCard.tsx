import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  colorClass: string;
  subtext?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, colorClass, subtext }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-20`}>
        {/* Using bg-opacity on the container relative to the text color usually works, but here colorClass is full bg. 
            We'll assume colorClass passes a full bg class (e.g. bg-amber-500). 
            To make it look nicer in dark mode, we might want to make the icon container slightly transparent or keep it solid.
            Let's keep it solid but maybe ensure icon stands out. */}
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );
};