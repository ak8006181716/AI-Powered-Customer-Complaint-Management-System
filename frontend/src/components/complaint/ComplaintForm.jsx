import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormField, resetForm, saveComplaint } from '../../redux/slices/complaintSlice';
import { 
  Calendar, 
  RotateCcw, 
  Save, 
  ChevronDown
} from 'lucide-react';

export const ComplaintForm = () => {
  const dispatch = useDispatch();
  const { currentComplaint, saving } = useSelector((state) => state.complaint);

  const handleInputChange = (field, value) => {
    dispatch(updateFormField({ field, value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(saveComplaint(currentComplaint));
  };

  const handleReset = () => {
    dispatch(resetForm());
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Log Customer Complaint</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">API & FDF Quality Assurance Module</p>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200/60">
          Pending Triage
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-4 flex-1">
        {/* Section 1: Origin & Customer Details */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            1. Origin & Customer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complaint Source
              </label>
              <input
                type="text"
                value={currentComplaint.complaint_source || ''}
                onChange={(e) => handleInputChange('complaint_source', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={currentComplaint.customer_name || ''}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Product & Batch Identification */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            2. Product & Batch Identification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={currentComplaint.product_name || ''}
                onChange={(e) => handleInputChange('product_name', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Strength/Grade
              </label>
              <input
                type="text"
                value={currentComplaint.strength || ''}
                onChange={(e) => handleInputChange('strength', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batch/Lot Number
              </label>
              <input
                type="text"
                value={currentComplaint.batch_number || ''}
                onChange={(e) => handleInputChange('batch_number', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manufacturing Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentComplaint.manufacturing_date || ''}
                  onChange={(e) => handleInputChange('manufacturing_date', e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3 py-2 pr-9 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                  value={currentComplaint.expiry_date || ''}
                  onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3 py-2 pr-9 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                  value={currentComplaint.quantity_affected || ''}
                  onChange={(e) => handleInputChange('quantity_affected', e.target.value)}
                  placeholder="Awaiting AI extraction..."
                  className="w-full px-3 py-2 pr-12 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">unit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Complaint Details */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            3. Complaint Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complaint Type
              </label>
              <input
                type="text"
                value={currentComplaint.complaint_type || ''}
                onChange={(e) => handleInputChange('complaint_type', e.target.value)}
                placeholder="Awaiting AI extraction..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complaint Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={currentComplaint.complaint_date || ''}
                  onChange={(e) => handleInputChange('complaint_date', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
              value={currentComplaint.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Awaiting AI extraction..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Section 4: Initial Assessment & Priority */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            4. Initial Assessment & Priority
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Severity
              </label>
              <div className="relative">
                <select
                  value={currentComplaint.severity || 'Medium'}
                  onChange={(e) => handleInputChange('severity', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-8 cursor-pointer font-medium"
                >
                  <option value="Minor">Minor</option>
                  <option value="Medium">Medium</option>
                  <option value="Major">Major</option>
                  <option value="Critical">Critical</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <div className="relative">
                <select
                  value={currentComplaint.priority || 'Medium'}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-8 cursor-pointer font-medium"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Form
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-sm shadow-blue-500/20"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save Complaint'}
        </button>
      </div>
    </div>
  );
};
