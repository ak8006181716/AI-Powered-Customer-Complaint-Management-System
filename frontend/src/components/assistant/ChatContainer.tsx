import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { sendMessage, addUserMessage } from '../../redux/slices/chatSlice';
import { Bot, User, Send, Loader2 } from 'lucide-react';

export const ChatContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, sending } = useSelector((state: RootState) => state.chat);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || sending) return;

    dispatch(addUserMessage(text));
    dispatch(sendMessage(text));
    if (!textToSend) setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-3">
      {/* Section Label */}
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        AI ASSISTANT
      </h3>

      {/* Default Initial Card Banner matching screenshot */}
      <div className="bg-blue-50/70 border border-blue-100/90 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-950">
        <div className="bg-blue-600 text-white rounded-lg p-2 shrink-0 flex items-center justify-center shadow-sm">
          <Bot className="w-4 h-4" />
        </div>
        <p className="leading-relaxed font-medium pt-0.5">
          Upload a complaint document or paste text above. I will automatically extract the details and populate the form for you.
        </p>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex space-x-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender !== 'user' && (
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-sm font-medium'
                  : msg.sender === 'system'
                  ? 'bg-slate-100 border border-slate-200 text-slate-600 italic'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none font-medium'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex space-x-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl p-2.5 text-xs flex items-center space-x-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Analyzing complaint & extracting details...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about this complaint..."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-12 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm transition"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || sending}
            className="absolute right-1.5 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer Disclaimer */}
        <p className="text-[11px] text-slate-400 text-center mt-2 font-medium">
          AI responses may contain errors. Please verify information.
        </p>
      </div>
    </div>
  );
};
