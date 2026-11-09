import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Sparkles, CornerDownLeft } from 'lucide-react';

interface ChatInputAreaProps {
  onSendMessage: (text: string) => void;
  onOpenMaterials: () => void;
  isLoading: boolean;
  activeMaterialsCount: number;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  onSendMessage,
  onOpenMaterials,
  isLoading,
  activeMaterialsCount,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 z-20 bg-gradient-to-t from-white via-white/95 to-white/0 pt-3 pb-4 px-4">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative bg-white rounded-2xl border border-violet-200 shadow-lg shadow-violet-100/50 p-2 sm:p-2.5 transition-all focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200"
        >
          <div className="flex items-end gap-2">
            {/* Attach Material Button */}
            <button
              type="button"
              onClick={onOpenMaterials}
              className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors shrink-0"
              title={
                activeMaterialsCount > 0
                  ? `${activeMaterialsCount} materi terlampir. Klik untuk kelola.`
                  : 'Unggah file materi belajar (PDF, PPT, DOCX, Gambar)'
              }
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Input Field */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={
                activeMaterialsCount > 0
                  ? 'Tanyakan konsep, rumus, atau bagian tertentu dari materi...'
                  : 'Tanyakan sesuatu atau unggah materi pembelajaranmu...'
              }
              className="flex-1 max-h-36 py-2 px-1 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent resize-none focus:outline-none leading-relaxed"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold transition-all shrink-0 shadow-xs active:scale-95 disabled:active:scale-100"
              title="Kirim pesan (Enter)"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Bottom helper hints */}
          <div className="px-2 pt-1.5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3 text-slate-400" />
              <span>Tekan <kbd className="font-mono bg-slate-100 px-1 py-0.2 rounded text-[10px]">Enter</kbd> untuk kirim, <kbd className="font-mono bg-slate-100 px-1 py-0.2 rounded text-[10px]">Shift+Enter</kbd> untuk baris baru</span>
            </span>

            {activeMaterialsCount > 0 ? (
              <span className="text-violet-600 font-medium hidden sm:inline flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{activeMaterialsCount} materi aktif sebagai acuan Chrisella</span>
              </span>
            ) : (
              <span className="text-slate-400 hidden sm:inline">
                Belum ada materi aktif
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
