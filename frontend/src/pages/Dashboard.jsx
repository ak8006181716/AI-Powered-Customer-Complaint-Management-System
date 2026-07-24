import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchComplaints } from '../redux/slices/complaintSlice';
import { ComplaintForm } from '../components/complaint/ComplaintForm';
import { AIAssistant } from '../components/assistant/AIAssistant';

export const Dashboard = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  return (
    <div className="h-screen w-screen bg-slate-100/70 text-slate-800 p-3 md:p-4 overflow-hidden flex flex-col">
      {/* Full Screen Dual Panel Grid */}
      <main className="w-full flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full w-full">
          {/* Left Panel - Log Customer Complaint Form */}
          <div className="lg:col-span-6 h-full overflow-hidden flex flex-col">
            <ComplaintForm />
          </div>

          {/* Right Panel - AI Complaint Intake Assistant */}
          <div className="lg:col-span-6 h-full overflow-hidden flex flex-col">
            <AIAssistant />
          </div>
        </div>
      </main>
    </div>
  );
};
