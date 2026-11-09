import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Award, Sparkles, RefreshCw, Volume2 } from 'lucide-react';
import { LearningMaterial, QuizQuestion } from '../types';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: LearningMaterial[];
  mentorAvatar: string;
  onPlayVoice: (id: string, text: string) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  materials,
  mentorAvatar,
  onPlayVoice,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  // Default interactive quiz questions based on active materials or core knowledge
  const activeMat = materials.find((m) => m.active);
  const activeTopic = activeMat ? activeMat.name : 'Pemahaman Materi Belajar';

  const defaultQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: `Berdasarkan prinsip pembelajaran efektif bersama mentor pada materi "${activeTopic}", pendekatan manakah yang paling tepat untuk menguji pemahaman konsep secara mendalam?`,
      options: [
        'Menghafal seluruh definisi kata per kata tanpa memahami konteks',
        'Menerapkan konsep ke dalam contoh kasus nyata dan menganalisis kesalahan',
        'Melewatkan bagian teori dan hanya membaca kesimpulan akhir',
        'Menunggu mentor memberikan jawaban tanpa mencoba menganalisis terlebih dahulu',
      ],
      correctIndex: 1,
      explanation:
        'Tepat sekali! Memahami konsep melalui analogi dan penerapan studi kasus nyata membantu memperkuat memori jangka panjang dan kemampuan penalaran kritis.',
    },
    {
      id: 2,
      question:
        'Ketika kamu menghadapi konsep atau rumus yang terasa rumit pada dokumen materi, strategi apa yang disarankan oleh Chrisella Kurniawan?',
      options: [
        'Langsung meninggalkan materi tersebut dan berpindah ke topik lain',
        'Memecah konsep rumit menjadi bagian-bagian kecil dan meminta penjelasan dengan analogi sederhana',
        'Menghafal rumus secara mekanis tanpa mengerti fungsi variabel di dalamnya',
        'Mengabaikan contoh soal yang ada di modul pembelajaran',
      ],
      correctIndex: 1,
      explanation:
        'Benar banget! Memecah materi (chunking) dan menggunakan analogi sehari-hari adalah cara paling efektif untuk menguasai konsep yang kompleks.',
    },
    {
      id: 3,
      question:
        'Mengapa penting untuk memeriksa umpan balik (feedback) dari mentor setelah menyelesaikan latihan soal?',
      options: [
        'Hanya untuk melihat nilai akhir tanpa membaca pembahasannya',
        'Untuk mengetahui letak kekeliruan berpikir dan memahami cara penyelesaian yang benar',
        'Agar tidak perlu mempelajari materi tersebut lagi di masa mendatang',
        'Supaya bisa langsung menyalin kunci jawaban ke tugas kuliah',
      ],
      correctIndex: 1,
      explanation:
        'Luar biasa! Feedback membantumu mengenali misconception (miskonsepsi) sejak dini sehingga kamu tidak mengulangi kesalahan yang sama.',
    },
  ];

  if (!isOpen) return null;

  const currentQ = defaultQuestions[currentStep];
  const isSelected = selectedAnswers[currentQ.id] !== undefined;
  const userChoice = selectedAnswers[currentQ.id];

  const handleSelectOption = (optionIndex: number) => {
    if (isSelected) return; // already answered
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optionIndex }));
    setShowExplanation((prev) => ({ ...prev, [currentQ.id]: true }));
  };

  const handleNext = () => {
    if (currentStep < defaultQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedAnswers({});
    setShowExplanation({});
    setIsFinished(false);
  };

  // Calculate score
  const score = defaultQuestions.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);

  const finalFeedback =
    score === defaultQuestions.length
      ? `Hebat sekali! Kamu menjawab semua pertanyaan kuis dengan sempurna (Skor ${score}/${defaultQuestions.length}). Pemahaman konsepmu sangat matang dan siap untuk topik yang lebih menantang!`
      : score >= 2
      ? `Bagus sekali! Kamu berhasil menjawab ${score} dari ${defaultQuestions.length} soal dengan tepat. Pemahamanmu sudah sangat baik, tinggal menyempurnakan beberapa detail kecil ya!`
      : `Usaha yang bagus! Kamu menjawab ${score} dari ${defaultQuestions.length} soal. Tenang saja, belajar adalah proses. Yuk kita bahas kembali bagian yang belum kamu kuasai bareng Chrisella!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-violet-100 max-w-xl w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50/80 to-purple-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Quiz Mode Interaktif</h2>
              <p className="text-xs text-slate-500">Uji pemahamanmu bersama Chrisella Kurniawan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {!isFinished ? (
            <div>
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                <span>
                  Pertanyaan {currentStep + 1} dari {defaultQuestions.length}
                </span>
                <span className="text-violet-600 font-bold">
                  {Math.round(((currentStep + 1) / defaultQuestions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-violet-600 h-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / defaultQuestions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question Text */}
              <h3 className="text-base font-bold text-slate-900 leading-snug mb-4">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5 mb-5">
                {currentQ.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  let styleClass =
                    'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/50 text-slate-800';

                  if (isSelected) {
                    if (idx === currentQ.correctIndex) {
                      styleClass = 'border-emerald-400 bg-emerald-50 text-emerald-950 font-medium ring-1 ring-emerald-300';
                    } else if (idx === userChoice) {
                      styleClass = 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-300';
                    } else {
                      styleClass = 'border-slate-200 bg-slate-50 opacity-50 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${styleClass}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected && idx === currentQ.correctIndex
                            ? 'bg-emerald-600 text-white'
                            : isSelected && idx === userChoice
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Mentor Comment */}
              {showExplanation[currentQ.id] && (
                <div
                  className={`p-4 rounded-xl border animate-in fade-in duration-200 mb-4 ${
                    userChoice === currentQ.correctIndex
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={mentorAvatar}
                      alt="Chrisella"
                      className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-white"
                    />
                    <div>
                      <p className="text-xs font-bold">
                        {userChoice === currentQ.correctIndex
                          ? 'Feedback Chrisella Kurniawan: Benar Sekali!'
                          : 'Feedback Chrisella Kurniawan: Pembahasan'}
                      </p>
                      <p className="text-xs mt-1 leading-relaxed">{currentQ.explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {isSelected && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-xs"
                  >
                    {currentStep < defaultQuestions.length - 1 ? 'Pertanyaan Selanjutnya' : 'Lihat Hasil Kuis'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Result Screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-600 mx-auto flex items-center justify-center shadow-inner">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Kuis Selesai!</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Skor Akhir Kamu: <span className="text-violet-600 font-bold text-base">{score}</span> dari {defaultQuestions.length} Soal Benar ({Math.round((score / defaultQuestions.length) * 100)}%)
                </p>
              </div>

              {/* Mentor review card */}
              <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 text-left flex items-start gap-3">
                <img
                  src={mentorAvatar}
                  alt="Chrisella"
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-violet-200"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-violet-900">Evaluasi Chrisella Kurniawan</p>
                    <button
                      type="button"
                      onClick={() => onPlayVoice('quiz_feedback', finalFeedback)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 hover:text-violet-900"
                      title="Dengarkan evaluasi mentor via suara perempuan"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Dengarkan</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{finalFeedback}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Ulangi Kuis</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-xs"
                >
                  Selesai & Lanjut Diskusi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
