"use client" 

import * as React from "react"
import { useState, useEffect, useRef } from "react";
import { Send, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatInputProps {
  context?: any;
  externalPrompt?: string | null;
}

const AIChatInput = ({ context, externalPrompt }: AIChatInputProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Team USA historian. Ask me anything about Olympic history or how your stats compare to the greats." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Handle external triggers (e.g. "Deep Research" button)
  useEffect(() => {
    if (externalPrompt) {
      handleSend(externalPrompt);
    }
  }, [externalPrompt]);

  const scrollToBottom = () => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (content: string = input) => {
    const textToSend = content.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context
        })
      });

      const data = await response.json();
      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[90%] px-6 py-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm transition-all ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white font-bold' 
                : 'bg-gray-100/90 backdrop-blur-md border border-gray-200 text-gray-800 font-medium'
            }`}>
              {msg.content.split('\n').map((line, li) => (
                <p key={li} className={li > 0 ? 'mt-3' : ''}>
                  {line.split('**').map((part, pi) => (
                    pi % 2 === 1 ? <strong key={pi} className="font-black text-gray-900">{part}</strong> : part
                  ))}
                </p>
              ))}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 border border-gray-100 px-6 py-4 rounded-[1.5rem]">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-300 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 pt-2">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl py-4 pl-6 pr-14 text-sm font-bold text-gray-900 transition-all placeholder:text-gray-400 outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-900 hover:bg-black disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-gray-200"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export { AIChatInput };
