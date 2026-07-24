import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { AlertCircle } from 'lucide-react';

export const ExtractionProgress: React.FC = () => {
  const { currentStep, error } = useSelector((state: RootState) => state.upload);

  if (currentStep === 'idle') return null;

  const getPercentage = () => {
    switch (currentStep) {
      case 'uploading': return 10;
      case 'extracting': return 35;
      case 'analyzing': return 65;
      case 'risk_assessment': return 85;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const pct = getPercentage();

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          EXTRACTION PROGRESS
        </span>
        <span className="text-xs font-bold text-slate-700">
          {pct}%
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {error ? (
        <div className="text-xs text-red-600 flex items-center gap-1.5 p-2 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      ) : (
        <p className="text-xs text-slate-500 font-medium">
          {currentStep === 'completed'
            ? 'Document extraction and AI risk assessment completed.'
            : 'Analyzing document content and extracting key details... Please wait, this may take a few moments.'}
        </p>
      )}
    </div>
  );
};
