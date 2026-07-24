import { configureStore } from '@reduxjs/toolkit';
import complaintReducer from './slices/complaintSlice';
import chatReducer from './slices/chatSlice';
import uploadReducer from './slices/uploadSlice';

export const store = configureStore({
  reducer: {
    complaint: complaintReducer,
    chat: chatReducer,
    upload: uploadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
