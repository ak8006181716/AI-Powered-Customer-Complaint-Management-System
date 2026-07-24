import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDocument } from '../../redux/slices/uploadSlice';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

export const DragDropUpload = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const { uploading } = useSelector((state) => state.upload);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      dispatch(uploadDocument(e.dataTransfer.files[0]));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      dispatch(uploadDocument(e.target.files[0]));
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    const blob = new Blob([pastedText], { type: 'text/plain' });
    const file = new File([blob], 'pasted_complaint.txt', { type: 'text/plain' });
    dispatch(uploadDocument(file));
    setPastedText('');
    setPasteMode(false);
  };

  return (
    <div className="space-y-3">
      {/* Dashed Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-200/90 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.eml"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {uploading ? 'Processing document...' : 'Drag & drop complaint document here'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">or click to browse from your computer</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-slate-200/80"></div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">OR</span>
        <div className="flex-1 h-px bg-slate-200/80"></div>
      </div>

      {/* Option to paste complaint text */}
      {!pasteMode ? (
        <button
          type="button"
          onClick={() => setPasteMode(true)}
          className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          Paste Complaint Text / Email
        </button>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <textarea
            rows={3}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste complaint email, report text, or message here..."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPasteMode(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePasteSubmit}
              disabled={!pastedText.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm"
            >
              Extract Information
            </button>
          </div>
        </div>
      )}

      {/* Format Info Card */}
      <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3 flex items-start gap-2.5 text-emerald-900">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs">
          <span className="font-semibold block">Supported formats: PDF, DOCX, TXT, EML</span>
          <span className="text-emerald-700/80 font-normal">Max file size: 10MB</span>
        </div>
      </div>
    </div>
  );
};
