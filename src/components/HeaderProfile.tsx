import React from 'react';
import { Sparkles, Volume2, VolumeX, FileText, Camera, CheckCircle2, Download } from 'lucide-react';
import { LearningMaterial, VoiceState } from '../types';

interface HeaderProfileProps {
  avatarUrl: string;
  onOpenPhotoModal: () => void;
  materials: LearningMaterial[];
  onOpenMaterialsModal: () => void;
  voiceState: VoiceState;
  onToggleVoice: () => void;
}

export const HeaderProfile: React.FC<HeaderProfileProps> = ({
  avatarUrl,
  onOpenPhotoModal,
  materials,
  onOpenMaterialsModal,
  voiceState,
  onToggleVoice,
}) => {
  const activeCount = materials.filter((m) => m.active).length;

  return (
    <header className="relative pt-6 pb-4 px-4 bg-gradient-to-b from-violet-100/70 via-purple-50/50 to-transparent border-b border-violet-100/60">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* Circular Profile Picture in Center */}
        <div className="relative group cursor-pointer mb-3.5" onClick={onOpenPhotoModal}>
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-lg shadow-violet-200/60 ring-4 ring-white ring-offset-2 ring-offset-violet-300 transition-all duration-300 group-hover:scale-105 group-hover:ring-violet-400 bg-violet-100">
            <img
              src={avatarUrl}
              alt="Chrisella Kurniawan"
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).src = '/assets/aistudio/image_a4770d04.png';
              }}
            />
            {/* Hover overlay for changing photo */}
            <div className="absolute inset-0 bg-violet-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
              <Camera className="w-6 h-6 mb-1 drop-shadow" />
              <span className="text-[11px] font-semibold tracking-wide">Ganti Foto</span>
            </div>
          </div>

          {/* Active Status Badge */}
          <div
            className="absolute bottom-1 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-white shadow-md ring-2 ring-violet-100"
            title="Chrisella Kurniawan Siap Membimbing"
          >
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
        </div>

        {/* Mentor Name & Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Chrisella Kurniawan
            </h1>
            <span title="Verified AI Mentor">
              <CheckCircle2 className="w-5 h-5 text-violet-600 fill-violet-100" />
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100/90 text-violet-800 text-xs sm:text-sm font-semibold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
            <span>Your Personal AI Mentor</span>
          </div>
        </div>

        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto line-clamp-2">
          Teman belajar & pembimbing pribadi interaktif. Siap membantu memahami materi, menjawab pertanyaan, dan menguji kemampuanmu.
        </p>

        {/* Quick Functional Chips */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
          {/* Active Material Chip */}
          <button
            onClick={onOpenMaterialsModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs border ${
              activeCount > 0
                ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 hover:border-violet-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-violet-600" />
            <span>
              {activeCount > 0
                ? `${activeCount} Materi Pembelajaran Aktif`
                : 'Unggah Materi Pembelajaran'}
            </span>
          </button>

          {/* Voice Over Toggle Chip */}
          <button
            onClick={onToggleVoice}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs border ${
              voiceState.enabled
                ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Klik untuk mengaktifkan / menonaktifkan Voice Over perempuan"
          >
            {voiceState.enabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Voice Over: Aktif</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>Voice Over: Nonaktif</span>
              </>
            )}
          </button>

          {/* Change Avatar Shortcut */}
          <button
            onClick={onOpenPhotoModal}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-all shadow-xs"
            title="Ganti foto profil"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ganti Foto</span>
          </button>

          {/* Export Project ZIP */}
          <a
            href="/api/download-zip"
            download="chrisella-kurniawan-ai-mentor.zip"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-all shadow-xs active:scale-95"
            title="Unduh seluruh file proyek aplikasi (.zip)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Proyek (.ZIP)</span>
          </a>
        </div>
      </div>
    </header>
  );
};
