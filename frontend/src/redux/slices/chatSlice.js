import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintApi } from '../../services/api';
import { setExtractedComplaint } from './complaintSlice';

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async ({ message, complaintId }, { dispatch }) => {
    const response = await complaintApi.sendChatMessage(message, complaintId);
    if (response.complaint) {
      dispatch(setExtractedComplaint(response.complaint));
    }
    return response;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state, action) => {
        state.loading = true;
        state.messages.push({
          id: Date.now().toString(),
          sender: 'user',
          text: action.meta.arg.message,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: action.payload.reply,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to process chat message';
        state.messages.push({
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date().toISOString(),
        });
      });
  },
});

export const { addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
