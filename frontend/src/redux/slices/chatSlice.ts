import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ChatMessage } from '../../types/complaint';
import { complaintApi } from '../../services/api';
import { setComplaint } from './complaintSlice';
import { updateProgress } from './uploadSlice';

interface ChatState {
  messages: ChatMessage[];
  sending: boolean;
  error: string | null;
}

const initialWelcomeMessage: ChatMessage = {
  id: 'welcome-msg',
  sender: 'assistant',
  text: 'Hello! I am your AI Pharmaceutical Complaint Intake Assistant. You can type a complaint narrative (e.g. "Customer received 20 damaged bottles of Paracetamol 500mg from Batch BT102"), upload a file (PDF, DOCX, TXT, EML), or ask for edits.',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const initialState: ChatState = {
  messages: [initialWelcomeMessage],
  sending: false,
  error: null
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (text: string, { dispatch, getState }) => {
    const state = getState() as any;
    const currentId = state.complaint?.currentComplaint?.id;

    dispatch(updateProgress('analyzing'));

    const response = await complaintApi.sendChatMessage(text, currentId);
    
    if (response.complaint) {
      dispatch(setComplaint(response.complaint));
    }
    
    dispatch(updateProgress('completed'));
    return response;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: `user-${Date.now()}`,
        sender: 'user',
        text: action.payload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    },
    addSystemMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: `sys-${Date.now()}`,
        sender: 'system',
        text: action.payload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    },
    clearChat: (state) => {
      state.messages = [initialWelcomeMessage];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.messages.push({
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: action.payload.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          extractionProgress: action.payload.extraction_progress
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.error.message || 'Failed to process message';
        state.messages.push({
          id: `err-${Date.now()}`,
          sender: 'system',
          text: `Error: ${action.error.message || 'Unable to connect to AI Assistant.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      });
  }
});

export const { addUserMessage, addSystemMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
