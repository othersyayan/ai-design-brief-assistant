import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useChatStream } from '../hooks/useChatStream';
import { AlertCircle, Send } from 'lucide-react';

interface Props {
  projectId: string;
  authToken: string;
  error?: string;
}

export const ChatContainer: React.FC<Props> = ({
  projectId,
  authToken,
  error,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isStreaming, streamingContent } = useChatStore();
  const { mutate: sendMessage, error: streamError } = useChatStream();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const prompt = input.trim();
    setInput('');
    sendMessage({ projectId, prompt, token: authToken });
  };

  return (
    <div className="flex h-[min(680px,calc(100vh-190px))] min-h-120 w-full flex-col overflow-hidden border border-[#d9ddd6] bg-[#fbfbf7] shadow-[8px_8px_0_#e1e7dd]">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && !isStreaming && (
          <div className="mx-auto mt-16 max-w-sm text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b26d42]">
              Conversation ready
            </p>
            <p className="mt-3 text-sm leading-6 text-[#738078]">
              Ask for material alternatives, finish recommendations, or a
              sharper design direction.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-bl-none px-4 py-2.5 text-sm bg-gray-100 text-gray-800">
              <p className="whitespace-pre-wrap leading-relaxed">
                {streamingContent}
                <span className="inline-block w-1.5 h-4 ml-1 bg-blue-600 animate-pulse align-middle" />
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {(error || streamError) && (
        <div className="flex items-center gap-2 border-t border-[#e8c9bd] bg-[#fff5f0] px-4 py-3 text-xs text-[#a84e38]">
          <AlertCircle size={15} />
          {error ||
            (streamError instanceof Error
              ? streamError.message
              : 'AI tidak dapat merespons saat ini.')}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-[#d9ddd6] bg-[#f0f2ec] p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about colour, material, or finish..."
          disabled={isStreaming}
          className="flex-1 border border-[#cbd4cb] bg-white px-4 py-3 text-sm outline-none focus:border-[#183f35] disabled:bg-[#e8ebe5]"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="inline-flex items-center gap-2 bg-[#183f35] px-4 py-3 text-sm font-semibold text-white hover:bg-[#26594a] disabled:opacity-50"
        >
          {isStreaming ? 'Thinking...' : 'Send'} <Send size={15} />
        </button>
      </form>
    </div>
  );
};
