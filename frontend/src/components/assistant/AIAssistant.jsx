import React from 'react';
import { DragDropUpload } from './DragDropUpload';
import { ExtractionProgress } from './ExtractionProgress';
import { ChatContainer } from './ChatContainer';
import { Sparkles } from 'lucide-react';

export const AIAssistant = () => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">AI Complaint Intake Assistant</h2>
        </div>
        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-200/60">
          BETA
        </span>
      </div>

      {/* Flexible Scrollable Content */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 min-h-0">
        {/* Step 1: File Drag & Drop Upload Zone */}
        <DragDropUpload />

        {/* Step 2: Extraction Progress */}
        <ExtractionProgress />

        {/* Step 3: AI Assistant Chat Workspace */}
        <ChatContainer />
      </div>
    </div>
  );
};
