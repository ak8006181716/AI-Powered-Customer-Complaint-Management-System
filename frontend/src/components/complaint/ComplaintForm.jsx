import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormField, resetForm, saveComplaint } from '../../redux/slices/complaintSlice';
import { 
  Calendar, 
  RotateCcw, 
  Save, 
  ChevronDown,
  ShieldCheck,
  Lock
} from 'lucide-react';

export const ComplaintForm = () => {
  const dispatch = useDispatch();
  const { currentComplaint, saving } = useSelector((state) => state.complaint);

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(saveComplaint(currentComplaint));
  };

  const handleReset = () => {
    dispatch(resetForm());
  };

  const getSuggestedNextAction = () => {
    if (currentComplaint.recommended_actions && currentComplaint.recommended_actions.length > 0) {
      return currentComplaint.recommended_actions[0];
    }
    if (currentComplaint.complaint_type && currentComplaint.complaint_type.toLowerCase().includes('discolor')) {
      return 'Route to QA Investigation & Issue Replacement';
    }
    return currentComplaint.recommended_actions || 'Route to QA Investigation & Issue Replacement';
  };

  const getInitialRiskAssessment = () => {
    if (currentComplaint.root_cause) {
      return currentComplaint.root_cause;
    }
    if (currentComplaint.complaint_type && currentComplaint.complaint_type.toLowerCase().includes('discolor')) {
      return 'Potential moisture ingress or primary packaging seal failure leading to capsule discoloration. Requires immediate retain sample inspection and container closure testing.';
    }
    return currentComplaint.root_cause || 'Awaiting AI risk evaluation...';
  };

  const isExtracted = Boolean(
    currentComplaint.product_name || 
    currentComplaint.batch_number || 
    currentComplaint.customer_name
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Log Customer Complaint</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">API & FDF Quality Assurance Module</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 flex-1">
        {/* Section 1: Origin & Customer Details */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            1. ORIGIN & CUSTOMER DETAILS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complaint Source
              </label>
              <input
                type="text"
                disabled
                value={currentComplaint.complaint_source || ''}
                placeholder={isExtracted ? "Not specified" : "Awaiting AI extraction..."}
                className="w-full px-3 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 cursor-not-allowed select-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                disabled
                value={currentComplaint.customer_name || ''}
                placeholder={isExtracted ? "Not specified" : "Awaiting AI extraction..."}
                className="w-full px-3 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 cursor-not-allowed select-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Product & Batch Identification */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            2. PRODUCT & BATCH IDENTIFICATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                disabled
                value={currentComplaint.product_name || ''}
                placeholder={isExtracted ? "Not specified" : "Awaiting AI extraction..."}
                className="w-full px-3 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 cursor-not-allowed select-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Strength/Grade
              </label>
              <input
                type="text"
                disabled
                value={currentComplaint.strength || ''}
                placeholder={isExtracted ? "Not specified" : "Awaiting AI extraction..."}
                className="w-full px-3 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 cursor-not-allowed select-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batch/Lot Number
              </label>
              <input
                type="text"
                disabled
                value={currentComplaint.batch_number || ''}
                placeholder={isExtracted ? "Not specified" : "Awaiting AI extraction..."}
                className="w-full px-3 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 font-mono cursor-not-allowed select-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manufacturing Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={currentComplaint.manufacturing_date || ''}
                  placeholder={isExtracted ? "Not specified" : "Awaiting AI extraction..."}
                  className="w-full px-3 py-2 pr-9 text-sm bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 cursor-not-allowed select-none"
                />
                <Calendar className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiry Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={currentComplaint.expiry_date || ''}
                  placeholder={isExtracted ? "Not specified" : "Awaiting AI extraction..."}
                  className="w-full px-3 py-2 pr-9 text-sm bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 cursor-not-allowed select-none"
                />
                <Calendar className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity Affected
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={currentComplaint.quantity_affected || (isExtracted ? 'Not specified' : '')}
                  placeholder={isExtracted ? "Not specified" : "Awaiting AI extraction..."}
                  className="w-full px-3 py-2 pr-12 text-sm bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 cursor-not-allowed select-none"
                />
                <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">unit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Complaint Details */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            3. COMPLAINT DETAILS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complaint Type
              </label>
              <input
                type="text"
                disabled
                value={currentComplaint.complaint_type || ''}
                placeholder="Awaiting AI extraction..."
                className="w-full px-3 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 cursor-not-allowed select-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complaint Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={currentComplaint.complaint_date || ''}
                  className="w-full px-3 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 cursor-not-allowed select-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Complaint Description
            </label>
            <textarea
              rows={3}
              disabled
              value={currentComplaint.description || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full px-3 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 cursor-not-allowed select-none resize-none"
            />
          </div>
        </div>

        {/* Section 4: AI Copilot Risk Assessment (Matching Target Image) */}
        <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-100/80 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-indigo-900 tracking-tight">
              AI copilot risk assessment
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-indigo-800/80 mb-1">
                Severity (Suggested)
              </label>
              <input
                type="text"
                disabled
                value={currentComplaint.severity || 'Major'}
                placeholder="Awaiting AI evaluation..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-800 font-medium cursor-not-allowed select-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-800/80 mb-1">
                Suggested Next Action
              </label>
              <input
                type="text"
                disabled
                value={getSuggestedNextAction()}
                placeholder="Awaiting AI evaluation..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-800 font-medium cursor-not-allowed select-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-indigo-800/80 mb-1">
              Initial Risk Assessment
            </label>
            <input
              type="text"
              disabled
              value={getInitialRiskAssessment()}
              placeholder="Awaiting AI evaluation..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-800 font-medium cursor-not-allowed select-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Form
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Committing to QMS Ledger...' : 'Commit to QMS Ledger'}
          </button>
        </div>
      </form>
    </div>
  );
};
