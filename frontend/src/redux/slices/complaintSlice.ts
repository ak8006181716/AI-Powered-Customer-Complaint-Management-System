import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Complaint } from '../../types/complaint';
import { complaintApi } from '../../services/api';

const initialComplaint: Complaint = {
  complaint_source: '',
  customer_name: '',
  product_name: '',
  strength: '',
  batch_number: '',
  manufacturing_date: '',
  expiry_date: '',
  quantity_affected: '',
  complaint_type: '',
  description: '',
  summary: '',
  severity: 'Medium',
  priority: 'Medium',
  root_cause: '',
  recommended_actions: [],
  completeness_score: 0,
  is_duplicate: false,
  status: 'Intake'
};

interface ComplaintState {
  currentComplaint: Complaint;
  complaintList: Complaint[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveSuccess: boolean;
}

const initialState: ComplaintState = {
  currentComplaint: initialComplaint,
  complaintList: [],
  loading: false,
  saving: false,
  error: null,
  saveSuccess: false
};

export const fetchComplaints = createAsyncThunk('complaint/fetchComplaints', async () => {
  return await complaintApi.getComplaints();
});

export const saveCurrentComplaint = createAsyncThunk('complaint/saveCurrentComplaint', async (_, { getState }) => {
  const state = getState() as { complaint: ComplaintState };
  const current = state.complaint.currentComplaint;
  if (current.id) {
    return await complaintApi.updateComplaint(current.id, current);
  } else {
    return await complaintApi.createComplaint(current);
  }
});

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    setComplaint: (state, action: PayloadAction<Complaint>) => {
      state.currentComplaint = { ...state.currentComplaint, ...action.payload };
    },
    resetForm: (state) => {
      state.currentComplaint = initialComplaint;
      state.error = null;
      state.saveSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaintList = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch complaints';
      })
      .addCase(saveCurrentComplaint.pending, (state) => {
        state.saving = true;
        state.saveSuccess = false;
      })
      .addCase(saveCurrentComplaint.fulfilled, (state, action) => {
        state.saving = false;
        state.saveSuccess = true;
        state.currentComplaint = action.payload;
        // update list
        const idx = state.complaintList.findIndex(c => c.id === action.payload.id);
        if (idx >= 0) {
          state.complaintList[idx] = action.payload;
        } else {
          state.complaintList.unshift(action.payload);
        }
      })
      .addCase(saveCurrentComplaint.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to save complaint';
      });
  }
});

export const { setComplaint, resetForm, clearError } = complaintSlice.actions;
export default complaintSlice.reducer;
