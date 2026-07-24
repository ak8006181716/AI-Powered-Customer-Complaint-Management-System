import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintApi } from '../../services/api';

const initialComplaintState = {
  id: '',
  complaint_source: 'Direct Customer',
  customer_name: '',
  product_name: '',
  strength: '',
  batch_number: '',
  manufacturing_date: '',
  expiry_date: '',
  quantity_affected: '',
  complaint_type: '',
  complaint_date: new Date().toISOString().split('T')[0],
  description: '',
  severity: 'Medium',
  priority: 'Medium',
  status: 'Pending',
  root_cause: '',
  recommended_actions: [],
};

const initialState = {
  currentComplaint: initialComplaintState,
  complaintsList: [],
  loading: false,
  saving: false,
  error: null,
};

export const fetchComplaints = createAsyncThunk(
  'complaint/fetchComplaints',
  async () => {
    return await complaintApi.getComplaints();
  }
);

export const saveComplaint = createAsyncThunk(
  'complaint/saveComplaint',
  async (complaintData) => {
    if (complaintData.id) {
      return await complaintApi.updateComplaint(complaintData.id, complaintData);
    }
    return await complaintApi.createComplaint(complaintData);
  }
);

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.currentComplaint[field] = value;
    },
    setExtractedComplaint: (state, action) => {
      state.currentComplaint = {
        ...state.currentComplaint,
        ...action.payload,
      };
    },
    resetForm: (state) => {
      state.currentComplaint = { ...initialComplaintState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaintsList = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch complaints';
      })
      .addCase(saveComplaint.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveComplaint.fulfilled, (state, action) => {
        state.saving = false;
        state.currentComplaint = action.payload;
      })
      .addCase(saveComplaint.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to save complaint';
      });
  },
});

export const { updateFormField, setExtractedComplaint, resetForm } = complaintSlice.actions;
export default complaintSlice.reducer;
