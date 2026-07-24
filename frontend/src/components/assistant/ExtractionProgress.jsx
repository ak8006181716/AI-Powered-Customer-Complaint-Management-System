import React from 'react';
import { useSelector } from 'react-redux';

export const ExtractionProgress = () => {
  const { uploading, progress, currentFile } = useSelector((state) => state.upload);

  const displayProgress = uploading ? (progress || 45) : 10;

  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500 uppercase tracking-wider text-[11px]">Extraction Progress</span>
        <span className="text-blue-600 font-bold">{displayProgress}%</span>
      </div>

      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-500 font-medium">
        {uploading
          ? `Extracting data from ${currentFile || 'document'}...`
          : 'Ready for document upload or manual entry'}
      </p>
    </div>
  );
};
