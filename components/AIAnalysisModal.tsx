import React from 'react';
import { WorkDay } from '../types';

// Componente desactivado para versión estable sin IA
interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: WorkDay[];
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;
  return null;
};