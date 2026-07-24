import React from 'react';
import { DragDropUpload } from './DragDropUpload';
import { ExtractionProgress } from './ExtractionProgress';
import { ChatContainer } from './ChatContainer';
import { Sparkles } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Right Panel Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            AI Complaint Intake Assistant
          </h2>
        </div>

        <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 text-[11px] font-extrabold rounded tracking-wider uppercase">
          BETA
        </span>
      </div>

      {/* Panel Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white flex flex-col">
        {/* Top Tools Area: Drag & Drop + Extraction Progress */}
        <DragDropUpload />
        <ExtractionProgress />

        {/* AI Assistant Chat Section */}
        <div className="flex-1 flex flex-col min-h-0 pt-2">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
};
