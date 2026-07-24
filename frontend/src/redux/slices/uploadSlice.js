import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintApi } from '../../services/api';
import { setExtractedComplaint } from './complaintSlice';
import { addMessage } from './chatSlice';

const initialState = {
  uploading: false,
  progress: 0,
  currentFile: null,
  error: null,
};

export const uploadDocument = createAsyncThunk(
  'upload/uploadDocument',
  async (file, { dispatch }) => {
    dispatch(setUploadProgress(20));
    const response = await complaintApi.uploadDocument(file);
    dispatch(setUploadProgress(70));
    
    const complaintData = response.complaint || response.extracted_data;
    if (complaintData) {
      dispatch(setExtractedComplaint(complaintData));
    }

    dispatch(addMessage({
      id: Date.now().toString(),
      sender: 'assistant',
      text: `Processed document "${file.name}". I have extracted the complaint details and populated the form for you.`,
      timestamp: new Date().toISOString(),
    }));

    dispatch(setUploadProgress(100));
    return response;
  }
);

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setUploadProgress: (state, action) => {
      state.progress = action.payload;
    },
    resetUpload: (state) => {
      state.uploading = false;
      state.progress = 0;
      state.currentFile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadDocument.pending, (state, action) => {
        state.uploading = true;
        state.currentFile = action.meta.arg.name;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.error.message || 'File upload failed';
      });
  },
});

export const { setUploadProgress, resetUpload } = uploadSlice.actions;
export default uploadSlice.reducer;
