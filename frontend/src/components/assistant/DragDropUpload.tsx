import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { uploadFile } from '../../redux/slices/uploadSlice';
import { UploadCloud, FileText, Info } from 'lucide-react';

export const DragDropUpload: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { uploading, fileName } = useSelector((state: RootState) => state.upload);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      dispatch(uploadFile(e.dataTransfer.files[0]));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      dispatch(uploadFile(e.target.files[0]));
    }
  };

  return (
    <div className="space-y-3">
      {/* Drag and Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/60'
            : 'border-slate-300/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt,.eml,.msg"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-1.5">
          <UploadCloud className="w-6 h-6 text-slate-400 mb-0.5" />
          <p className="text-xs font-semibold text-slate-700">
            {uploading ? 'Uploading complaint document...' : 'Drag & drop complaint document here'}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            or <span className="text-blue-600 font-semibold hover:underline">click to browse</span>
          </p>
        </div>
        {fileName && (
          <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Attached: {fileName}
          </div>
        )}
      </div>

      {/* OR Divider */}
      <div className="relative flex items-center justify-center my-2">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          OR
        </span>
        <div className="border-t border-slate-200 w-full" />
      </div>

      {/* Paste Complaint Text Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
      >
        <FileText className="w-4 h-4 text-slate-500" /> Paste Complaint Text / Email
      </button>

      {/* Supported Formats Card */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-semibold text-emerald-800">
            Supported formats: PDF, DOCX, TXT, EML
          </div>
          <div className="text-emerald-700 text-[11px]">
            Max file size: 10MB
          </div>
        </div>
      </div>
    </div>
  );
};
