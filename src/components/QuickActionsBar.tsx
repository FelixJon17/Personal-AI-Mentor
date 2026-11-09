import React from 'react';
import { Lightbulb, FileText, HelpCircle, CheckSquare, MessageSquareText, UploadCloud } from 'lucide-react';

interface QuickActionsBarProps {
  onSelectAction: (action: 'explain_more' | 'summarize' | 'practice_questions' | 'quiz' | 'feedback') => void;
  onOpenMaterials: () => void;
  disabled?: boolean;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onSelectAction,
  onOpenMaterials,
  disabled,
}) => {
  const actions = [
    {
      id: 'explain_more' as const,
      label: 'Jelaskan Lebih Sederhana',
      icon: Lightbulb,
      color: 'hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50',
      badgeColor: 'text-amber-600',
    },
    {
      id: 'summarize' as const,
      label: 'Rangkum Materi',
      icon: FileText,
      color: 'hover:text-violet-700 hover:border-violet-300 hover:bg-violet-50',
      badgeColor: 'text-violet-600',
    },
    {
      id: 'practice_questions' as const,
      label: 'Latihan Soal',
      icon: HelpCircle,
      color: 'hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50',
      badgeColor: 'text-blue-600',
    },
    {
      id: 'quiz' as const,
      label: 'Kuis Interaktif',
      icon: CheckSquare,
      color: 'hover:text-purple-700 hover:border-purple-300 hover:bg-purple-50',
      badgeColor: 'text-purple-600',
    },
    {
      id: 'feedback' as const,
      label: 'Koreksi & Feedback',
      icon: MessageSquareText,
      color: 'hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50',
      badgeColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="py-2.5 px-4 bg-white/90 backdrop-blur-xs border-y border-violet-100/70 sticky top-0 z-20">
      <div className="max-w-3xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-1 pt-0.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <span>Aksi Belajar:</span>
        </span>

        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectAction(act.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${act.color}`}
            >
              <Icon className={`w-3.5 h-3.5 ${act.badgeColor}`} />
              <span>{act.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOpenMaterials}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 transition-all shadow-2xs active:scale-95 ml-auto"
        >
          <UploadCloud className="w-3.5 h-3.5 text-violet-600" />
          <span>Kelola Materi</span>
        </button>
      </div>
    </div>
  );
};
