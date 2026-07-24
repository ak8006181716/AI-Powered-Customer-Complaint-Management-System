import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintApi } from '../../services/api';
import { setComplaint } from './complaintSlice';
import { addSystemMessage } from './chatSlice';

export type ProgressStep = 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'risk_assessment' | 'completed' | 'error';

interface UploadState {
  currentStep: ProgressStep;
  fileName: string | null;
  fileSize: number | null;
  extractedText: string | null;
  uploading: boolean;
  error: string | null;
}

const initialState: UploadState = {
  currentStep: 'idle',
  fileName: null,
  fileSize: null,
  extractedText: null,
  uploading: false,
  error: null
};

export const uploadFile = createAsyncThunk(
  'upload/uploadFile',
  async (file: File, { dispatch }) => {
    dispatch(setStep('uploading'));
    dispatch(setFileInfo({ name: file.name, size: file.size }));

    // Simulate progressive step updates for high quality UX animation
    await new Promise(r => setTimeout(r, 400));
    dispatch(setStep('extracting'));

    const response = await complaintApi.uploadDocument(file);

    await new Promise(r => setTimeout(r, 400));
    dispatch(setStep('analyzing'));

    await new Promise(r => setTimeout(r, 400));
    dispatch(setStep('risk_assessment'));

    if (response.complaint) {
      dispatch(setComplaint(response.complaint));
    }

    await new Promise(r => setTimeout(r, 300));
    dispatch(setStep('completed'));

    dispatch(addSystemMessage(`Document '${file.name}' processed successfully. AI populated complaint form details.`));

    return response;
  }
);

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<ProgressStep>) => {
      state.currentStep = action.payload;
    },
    setFileInfo: (state, action: PayloadAction<{ name: string; size: number }>) => {
      state.fileName = action.payload.name;
      state.fileSize = action.payload.size;
    },
    updateProgress: (state, action: PayloadAction<ProgressStep>) => {
      state.currentStep = action.payload;
    },
    resetUpload: (state) => {
      state.currentStep = 'idle';
      state.fileName = null;
      state.fileSize = null;
      state.extractedText = null;
      state.uploading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.extractedText = action.payload.extracted_text;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploading = false;
        state.currentStep = 'error';
        state.error = action.error.message || 'File upload failed';
      });
  }
});

export const { setStep, setFileInfo, updateProgress, resetUpload } = uploadSlice.actions;
export default uploadSlice.reducer;
