import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage } from '../../redux/slices/chatSlice';
import { Send, Bot, User } from 'lucide-react';

export const ChatContainer = () => {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { messages, loading } = useSelector((state) => state.chat);
  const { currentComplaint } = useSelector((state) => state.complaint);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    dispatch(sendChatMessage({
      message: input.trim(),
      complaintId: currentComplaint.id || undefined,
    }));
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-[220px] bg-slate-50/50 border border-slate-200/80 rounded-xl overflow-hidden">
      {/* Header Label */}
      <div className="px-3.5 py-2 bg-slate-100/60 border-b border-slate-200/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        AI Assistant
      </div>

      {/* Scrollable Chat Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 max-h-[260px]">
        {messages.length === 0 ? (
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              Upload a complaint document or paste text above. I will automatically extract the details and populate the form for you.
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-slate-700 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pl-2">
            <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>AI is analyzing complaint data...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Footer Subtext */}
      <div className="p-2.5 bg-white border-t border-slate-200/80">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about this complaint..."
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center transition-all flex-shrink-0 shadow-sm shadow-blue-500/20"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">
          AI responses may contain errors. Please verify information.
        </p>
      </div>
    </div>
  );
};
