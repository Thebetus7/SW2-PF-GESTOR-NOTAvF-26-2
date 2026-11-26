'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  Github,
  ArrowRight,
  ShieldCheck,
  Mail,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'gemini' | 'groq' | 'fallback';
  timestamp: string;
}

const STORAGE_KEY = 'gestornotas_chat_history';

const INITIAL_MESSAGE: Message = {
  id: 'init-msg',
  role: 'assistant',
  content:
    '¡Hola! 👋 Soy el asistente virtual de **EduGradeIA**.\n\n¿En qué puedo orientarte hoy? Puedes preguntarme cómo funciona el escaneo QR, la calificación con IA multimodal, los módulos para docentes y estudiantes o solicitar una demostración por WhatsApp.',
  source: 'fallback',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTIONS = [
  '¿Cómo funciona el escaneo QR?',
  'Módulo para docentes y rúbricas',
  '¿Cómo califica la IA los exámenes?',
  '📧 Correo: oficina@edugrade.com',
  '📱 Contactar por WhatsApp (+591 77389330)',
  '🐙 Ver código en GitHub',
];

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar historial de sessionStorage al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed.map((message: Message) =>
              message.role === 'assistant' && typeof message.content === 'string'
                ? { ...message, content: message.content.replace(/GestorNotas IA/g, 'EduGradeIA').replace(/GestorNotas%20IA/g, 'EduGradeIA') }
                : message,
            ));
          }
        }
      } catch (e) {
        console.warn('Error reading chat history from sessionStorage', e);
      }
    }
  }, []);

  // Guardar en sessionStorage al cambiar
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.warn('Error saving chat history to sessionStorage', e);
      }
    }
  }, [messages]);

  // Auto-scroll al final de mensajes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Foco en input al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleReset = () => {
    const resetList = [
      {
        ...INITIAL_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(resetList);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    if (text.length > 500) {
      alert('Por favor limita tu consulta a 500 caracteres.');
      return;
    }

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/landing-api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: Message = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content:
          data.response ||
          'No pudimos procesar la respuesta. Por favor contáctanos por WhatsApp al +591 77389330.',
        source: data.source || 'fallback',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error invoking chat API:', err);
      const fallbackMessage: Message = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content:
          'Lo sentimos, hubo una pequeña dificultad de conexión. Puedes escribirnos directamente a nuestro **[WhatsApp Oficial (+591 77389330)](https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20EduGradeIA)**.',
        source: 'fallback',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizador básico y seguro de texto Markdown (links, negritas, saltos)
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');

    return lines.map((line, lineIdx) => {
      // Regex para encontrar links [texto](url) y negritas **texto**
      const parts = [];
      let lastIndex = 0;
      const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
      let match;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }

        if (match[1] && match[2]) {
          // Link
          parts.push(
            <a
              key={`link-${match.index}`}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8B5E3C] dark:text-[#D4A373] underline font-semibold hover:text-[#6B4226] inline-flex items-center gap-0.5"
            >
              <span>{match[1]}</span>
              <ExternalLink className="w-3 h-3 inline ml-0.5" />
            </a>
          );
        } else if (match[3]) {
          // Bold
          parts.push(
            <strong key={`bold-${match.index}`} className="font-bold text-[#2C1810] dark:text-white">
              {match[3]}
            </strong>
          );
        }
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <span key={`line-${lineIdx}`} className="block min-h-[1.2em]">
          {parts.length > 0 ? parts : ' '}
        </span>
      );
    });
  };

  return (
    <aside aria-label="Asistente Virtual EduGradeIA" className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Bubble */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Cerrar chat de asistencia' : 'Abrir chat de asistencia con IA'}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(139,94,60,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-[#2C1810] rotate-90'
            : 'bg-gradient-to-tr from-[#8B5E3C] via-[#A6754E] to-[#6B4226]'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7 text-[#FDF6EC]" />
            {/* Ping notification badge */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#059669] border-2 border-white"></span>
            </span>
          </>
        )}
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ventana de conversación con el Asistente Virtual"
          className="absolute bottom-16 right-0 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#FDFBF7] dark:bg-[#1A1412] rounded-3xl border border-[#E8DCC8] dark:border-[#3D2D20] shadow-[0_20px_50px_rgba(44,24,16,0.25)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="bg-[#1A1412] text-[#FDF6EC] p-4 flex items-center justify-between border-b border-[#38281E]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5E3C] to-[#6B4226] flex items-center justify-center text-white shadow">
                <Sparkles className="w-5 h-5 text-[#FDF6EC]" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-[#FDF6EC] leading-tight">
                  Asistente EduGradeIA
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
                  <span className="text-[11px] font-mono text-[#D4A373]">IA Activa &bull; Base de Datos</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title="Reiniciar conversación"
                className="p-1.5 rounded-lg text-[#D5C9B8] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Reiniciar chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimizar"
                className="p-1.5 rounded-lg text-[#D5C9B8] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm bg-gradient-to-b from-[#FDFBF7] to-[#FAF0E1]/40 dark:from-[#1A1412] dark:to-[#261A13]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#FAF0E1] dark:bg-[#32231A] text-[#8B5E3C] dark:text-[#D4A373] border border-[#E8DCC8] dark:border-[#3D2D20] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="max-w-[82%] space-y-1">
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed text-xs sm:text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#8B5E3C] text-white rounded-br-none shadow-sm'
                        : 'bg-white dark:bg-[#261A13] text-[#2C1810] dark:text-[#FDF6EC] border border-[#E8DDD0] dark:border-[#38281E] rounded-bl-none shadow-sm'
                    }`}
                  >
                    {renderFormattedText(msg.content)}
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-[10px] text-[#9C8E85] ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <span className="font-mono text-[9px] uppercase px-1 rounded bg-[#F0E6D6] dark:bg-[#1F150F] text-[#8B5E3C] dark:text-[#D4A373]">
                        {msg.source === 'gemini' ? 'Gemini IA' : msg.source === 'groq' ? 'Groq 70B' : 'Base SDD'}
                      </span>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#FAF0E1] text-[#8B5E3C] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-[#261A13] border border-[#E8DDD0] dark:border-[#38281E] p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8B5E3C] animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-[#8B5E3C] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#8B5E3C] animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions Chips Bar */}
          <div className="px-3 py-2 bg-[#F0E6D6]/60 dark:bg-[#1F150F] border-t border-[#E8DDD0] dark:border-[#38281E] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
            {SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(suggestion)}
                disabled={isLoading}
                className="text-[11px] font-medium text-[#6B5B52] dark:text-[#D5C9B8] bg-white dark:bg-[#261A13] hover:bg-[#FAF0E1] dark:hover:bg-[#32231A] border border-[#E8DCC8] dark:border-[#38281E] px-2.5 py-1 rounded-full transition-colors shrink-0"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="px-3 py-1.5 bg-[#FDFBF7] dark:bg-[#1A1412] border-t border-[#E8DDD0] dark:border-[#38281E] flex items-center justify-between text-[11px] gap-2">
            <a
              href="mailto:oficina@edugrade.com"
              className="text-[#8B5E3C] dark:text-[#D4A373] hover:underline flex items-center gap-1 font-semibold"
              title="Escribir a oficina@edugrade.com"
            >
              <Mail className="w-3 h-3" />
              <span>oficina@edugrade.com</span>
            </a>
            <a
              href="https://wa.me/59177389330?text=Hola%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20EduGradeIA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#059669] hover:underline flex items-center gap-1 font-semibold"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
            <a
              href="https://github.com/edberto/gestor-notas-ia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B5B52] dark:text-[#D5C9B8] hover:text-[#2C1810] flex items-center gap-1"
            >
              <Github className="w-3 h-3" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Input Box */}
          <p className="bg-white px-3 pt-2 text-[11px] text-[#6B5B52] dark:bg-[#261A13] dark:text-[#D5C9B8]">Evita compartir datos sensibles. <a href="/privacidad" className="underline">Política de privacidad</a></p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-[#261A13] border-t border-[#E8DCC8] dark:border-[#38281E] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Haz una pregunta sobre el software..."
              maxLength={500}
              disabled={isLoading}
              className="flex-1 bg-[#FDFBF7] dark:bg-[#1F150F] text-[#2C1810] dark:text-white placeholder-[#9C8E85] text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-[#E8DDD0] dark:border-[#38281E] focus:outline-none focus:border-[#8B5E3C]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Enviar mensaje"
              className="w-10 h-10 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
};
