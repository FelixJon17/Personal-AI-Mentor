import React from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Sparkles, FastForward } from 'lucide-react';
import { VoiceState } from '../types';

interface AudioPlayerBarProps {
  voiceState: VoiceState;
  onPlayResume: () => void;
  onPause: () => void;
  onStop: () => void;
  onToggleAutoPlay: () => void;
  onRateChange: (rate: number) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  voiceState,
  onPlayResume,
  onPause,
  onStop,
  onToggleAutoPlay,
  onRateChange,
}) => {
  // Only show docked bar if audio is actively playing/paused, or if autoPlay is enabled
  const isAudioActive = voiceState.isPlaying || voiceState.isPaused;

  if (!isAudioActive) {
    return null;
  }

  const nextRate = voiceState.playbackRate === 1.0 ? 1.25 : voiceState.playbackRate === 1.25 ? 0.85 : 1.0;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-lg bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-violet-500/30 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mentor voice status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
            <Volume2 className={`w-4 h-4 ${voiceState.isPlaying ? 'animate-pulse text-violet-200' : 'text-white'}`} />
            {voiceState.isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span>Voice Over Chrisella</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-violet-800 text-violet-200">
                Suara Perempuan
              </span>
            </p>
            <p className="text-[11px] text-slate-300 truncate">
              {voiceState.isPlaying ? 'Sedang membacakan penjelasan materi...' : 'Audio dijeda'}
            </p>
          </div>
        </div>

        {/* Center: Controls (Play/Pause, Stop, Speed) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Speed switcher */}
          <button
            type="button"
            onClick={() => onRateChange(nextRate)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-violet-300 transition-colors"
            title="Ubah kecepatan suara"
          >
            {voiceState.playbackRate}x
          </button>

          {/* Play/Pause */}
          {voiceState.isPlaying ? (
            <button
              type="button"
              onClick={onPause}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-sm"
              title="Jeda"
            >
              <Pause className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onPlayResume}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-sm"
              title="Lanjutkan"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          )}

          {/* Stop */}
          <button
            type="button"
            onClick={onStop}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 transition-colors"
            title="Hentikan audio"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
