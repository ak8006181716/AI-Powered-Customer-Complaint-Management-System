import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { resetForm, saveCurrentComplaint } from '../../redux/slices/complaintSlice';
import { clearChat } from '../../redux/slices/chatSlice';
import { resetUpload } from '../../redux/slices/uploadSlice';
import { 
  Calendar, RotateCcw, Save, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react';

export const ComplaintForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentComplaint, saving, saveSuccess, error } = useSelector((state: RootState) => state.complaint);

  const handleReset = () => {
    dispatch(resetForm());
    dispatch(clearChat());
    dispatch(resetUpload());
  };

  const handleSave = () => {
    dispatch(saveCurrentComplaint());
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-white">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Log Customer Complaint
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            API & FDF Quality Assurance Module
          </p>
        </div>

        <span className="px-3 py-1 bg-amber-50/90 border border-amber-200/80 text-amber-700 rounded-full text-xs font-semibold tracking-wide">
          Pending Triage
        </span>
      </div>

      {/* Duplicate Warning Banner */}
      {currentComplaint.is_duplicate && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center text-xs text-amber-800 gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span><strong>Potential Duplicate Detected:</strong> A complaint for Batch <strong>{currentComplaint.batch_number}</strong> already exists.</span>
        </div>
      )}

      {/* Form Body - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
        {/* Section 1: Origin */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            1. ORIGIN & CUSTOMER DETAILS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Source</label>
              <input
                type="text"
                readOnly
                value={currentComplaint.complaint_source || ''}
                placeholder="Awaiting AI extraction..."
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none cursor-default"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                readOnly
                value={currentComplaint.customer_name || ''}
                placeholder="Awaiting AI extraction..."
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none cursor-default"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Product */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            2. PRODUCT & BATCH IDENTIFICATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                readOnly
                value={currentComplaint.product_name || ''}
                placeholder="Awaiting AI extraction..."
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none cursor-default"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Strength/Grade</label>
              <input
                type="text"
                readOnly
                value={currentComplaint.strength || ''}
                placeholder="Awaiting AI extraction..."
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none cursor-default"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batch/Lot Number</label>
              <input
                type="text"
                readOnly
                value={currentComplaint.batch_number || ''}
                placeholder="Awaiting AI extraction..."
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 font-mono font-semibold placeholder-slate-400 focus:outline-none cursor-default"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturing Date</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={currentComplaint.manufacturing_date || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg pl-3.5 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none cursor-default"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={currentComplaint.expiry_date || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg pl-3.5 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none cursor-default"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity Affected</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={currentComplaint.quantity_affected || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none cursor-default"
                />
                <span className="absolute right-3 top-2 text-xs font-medium text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  unit
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Complaint Details */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            3. COMPLAINT DETAILS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Type</label>
              <input
                type="text"
                readOnly
                value={currentComplaint.complaint_type || ''}
                placeholder="Awaiting AI extraction..."
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none cursor-default"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Date</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={currentComplaint.created_at ? new Date(currentComplaint.created_at).toLocaleDateString() : ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg pl-3.5 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none cursor-default"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Complaint Description</label>
            <textarea
              readOnly
              rows={3}
              value={currentComplaint.description || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-slate-50/60 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none cursor-default leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Section 4: Initial Assessment & Priority */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            4. INITIAL ASSESSMENT & PRIORITY
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Severity</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={currentComplaint.severity || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg pl-3.5 pr-9 py-2.5 text-xs text-slate-800 font-semibold placeholder-slate-400 focus:outline-none cursor-default"
                />
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={currentComplaint.priority || ''}
                  placeholder="Awaiting AI extraction..."
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg pl-3.5 pr-9 py-2.5 text-xs text-slate-800 font-semibold placeholder-slate-400 focus:outline-none cursor-default"
                />
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Optional AI Risk Assessment Card if present */}
        {currentComplaint.root_cause && (
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
              AI Risk Assessment Summary
            </h4>
            <p className="text-xs text-blue-950 leading-relaxed font-medium">
              {currentComplaint.root_cause}
            </p>
          </div>
        )}
      </div>

      {/* Form Footer Action Buttons */}
      <div className="p-4 px-6 border-t border-slate-100 bg-white flex items-center justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Reset Form
        </button>

        <div className="flex items-center space-x-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Saved to DB
            </span>
          )}
          {error && <span className="text-xs text-red-500">{error}</span>}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Complaint'}
          </button>
        </div>
      </div>
    </div>
  );
};
