import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Copy,
  Check,
  Sparkles,
  Lightbulb,
  CornerDownRight,
} from 'lucide-react';
import { ChatMessage, VoiceState } from '../types';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  mentorAvatar: string;
  voiceState: VoiceState;
  onPlayVoice: (messageId: string, text: string, cachedAudio?: string) => void;
  onPauseVoice: () => void;
  onResumeVoice: () => void;
  onStopVoice: () => void;
  onExplainSimpler?: (text: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  mentorAvatar,
  voiceState,
  onPlayVoice,
  onPauseVoice,
  onResumeVoice,
  onStopVoice,
  onExplainSimpler,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';
  const isCurrentlyPlaying =
    voiceState.isPlaying && voiceState.currentMessageId === message.id;
  const isCurrentlyPaused =
    voiceState.isPaused && voiceState.currentMessageId === message.id;
  const isLoadingAudio = voiceState.loadingMessageId === message.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render nicely formatted markdown paragraphs, bold, lists
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Headers (### or ##)
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-900 mt-2.5 mb-1 text-violet-900">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-slate-900 mt-3 mb-1.5 text-violet-950 border-b border-violet-100 pb-0.5">
            {line.replace('## ', '')}
          </h3>
        );
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().replace(/^[-*]\s+/, '');
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0"></span>
            <span className="flex-1 text-slate-800 leading-relaxed">
              {parseBold(bulletText)}
            </span>
          </div>
        );
      }

      // Numbered list (e.g. "1. ")
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="font-bold text-violet-600 text-xs mt-0.5 shrink-0">
              {numMatch[1]}.
            </span>
            <span className="flex-1 text-slate-800 leading-relaxed">
              {parseBold(numMatch[2])}
            </span>
          </div>
        );
      }

      // Quote / Callout (e.g. "> ")
      if (line.trim().startsWith('> ')) {
        return (
          <div
            key={idx}
            className="my-2 pl-3 py-1.5 border-l-3 border-violet-400 bg-violet-50/60 rounded-r-lg text-xs italic text-violet-900"
          >
            {parseBold(line.trim().replace(/^>\s*/, ''))}
          </div>
        );
      }

      // Normal paragraph
      return (
        <p key={idx} className="my-1 text-slate-800 leading-relaxed">
          {parseBold(line)}
        </p>
      );
    });
  };

  // Helper to parse **bold** text
  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 text-violet-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 shadow-sm">
          <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap selection:bg-purple-300 selection:text-violet-950">
            {message.text}
          </p>
          <div className="mt-1.5 text-right text-[10px] text-purple-200/80">
            {message.timestamp}
          </div>
        </div>
      </div>
    );
  }

  // Mentor (Chrisella Kurniawan) Bubble
  return (
    <div className="flex items-start gap-3 mb-5 group animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Mentor Avatar */}
      <div className="relative shrink-0 mt-0.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-violet-200 shadow-xs bg-violet-100">
          <img
            src={mentorAvatar}
            alt="Chrisella Kurniawan"
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/aistudio/image_a4770d04.png';
            }}
          />
        </div>
        {isCurrentlyPlaying && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-600"></span>
          </span>
        )}
      </div>

      {/* Message Card */}
      <div className="flex-1 max-w-[90%] sm:max-w-[85%]">
        <div className="flex items-center gap-2 mb-1 pl-1">
          <span className="text-xs font-bold text-slate-900">Chrisella Kurniawan</span>
          <span className="text-[10px] text-slate-400 font-medium">{message.timestamp}</span>
          {isCurrentlyPlaying && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 animate-pulse">
              <span className="flex items-center gap-0.5">
                <span className="w-1 h-2 bg-purple-600 rounded-full animate-bounce"></span>
                <span className="w-1 h-3.5 bg-purple-600 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1 h-2.5 bg-purple-600 rounded-full animate-bounce [animation-delay:0.3s]"></span>
              </span>
              <span>Sedang berbicara...</span>
            </span>
          )}
        </div>

        <div
          className={`relative rounded-2xl rounded-tl-xs p-4 sm:p-5 text-sm sm:text-[15px] border transition-all duration-200 ${
            isCurrentlyPlaying
              ? 'bg-violet-50/50 border-violet-300 shadow-md ring-2 ring-violet-200/50'
              : 'bg-white border-slate-200/80 shadow-xs hover:border-violet-200'
          }`}
        >
          {/* Message content */}
          <div className="prose prose-sm max-w-none text-slate-800">
            {renderFormattedText(message.text)}
          </div>

          {/* Action Bar on Bubble (Voice, Copy, Explain) */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            {/* Voice Controls on this Bubble */}
            <div className="flex items-center gap-1.5">
              {!isCurrentlyPlaying && !isCurrentlyPaused ? (
                <button
                  type="button"
                  onClick={() => onPlayVoice(message.id, message.text, message.audioBase64)}
                  disabled={isLoadingAudio}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 transition-colors shadow-2xs active:scale-95"
                  title="Dengarkan penjelasan suara perempuan Chrisella Kurniawan"
                >
                  {isLoadingAudio ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyiapkan Suara...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-violet-600" />
                      <span>Dengarkan Suara</span>
                    </>
                  )}
                </button>
              ) : isCurrentlyPlaying ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onPauseVoice}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                    title="Jeda suara"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </button>
                  <button
                    type="button"
                    onClick={onStopVoice}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                    title="Hentikan suara"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onResumeVoice}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-xs"
                    title="Lanjutkan suara"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Lanjutkan</span>
                  </button>
                  <button
                    type="button"
                    onClick={onStopVoice}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    title="Hentikan suara"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop</span>
                  </button>
                </div>
              )}
            </div>

            {/* Utility actions: Copy & Explain Simpler */}
            <div className="flex items-center gap-1.5 text-slate-400">
              {onExplainSimpler && (
                <button
                  type="button"
                  onClick={() => onExplainSimpler(message.text)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                  title="Minta Chrisella menyederhanakan penjelasan ini"
                >
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  <span className="hidden sm:inline">Jelaskan Sederhana</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="Salin teks jawaban"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
