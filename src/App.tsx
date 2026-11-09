import React, { useState, useEffect, useRef } from 'react';
import { HeaderProfile } from './components/HeaderProfile';
import { QuickActionsBar } from './components/QuickActionsBar';
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { ChatInputArea } from './components/ChatInputArea';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { MaterialsModal } from './components/MaterialsModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { QuizModal } from './components/QuizModal';
import { ChatMessage, LearningMaterial, VoiceState } from './types';
import { sendChatMessage } from './services/api';
import { voicePlayer } from './services/voiceService';
import { Sparkles, Bot, AlertCircle } from 'lucide-react';

const DEFAULT_AVATAR = '/assets/aistudio/image_a4770d04.png';

const INITIAL_GREETING: ChatMessage = {
  id: 'msg_welcome',
  sender: 'mentor',
  text: `Halo! Saya **Chrisella Kurniawan**, your personal AI mentor. Senang sekali bisa mendampingi dan belajar bareng kamu hari ini! ✨\n\nKamu bisa mengunggah materi kuliah atau bahan belajar (berupa **PDF, DOCX, PPT, PPTX**, atau **Gambar**) melalui tombol **"Kelola Materi"** di atas. Saya akan mempelajari dokumen tersebut secara menyeluruh dan siap membantumu:\n- Menjelaskan konsep yang rumit dengan analogi sederhana\n- Membuat rangkuman intisari materi\n- Memberikan latihan soal & kuis interaktif\n- Memeriksa serta memberikan feedback atas tugas atau jawabanmu\n- Mendengarkan penjelasan langsung dengan **Voice Over** suara perempuan.\n\nYuk, topik atau materi apa yang ingin kita bahas pertama kali?`,
  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
};

export default function App() {
  // Profile Avatar State
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem('chrisella_avatar') || DEFAULT_AVATAR;
  });

  // Chat Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Materials State
  const [materials, setMaterials] = useState<LearningMaterial[]>(() => {
    const saved = localStorage.getItem('chrisella_materials');
    return saved ? JSON.parse(saved) : [];
  });

  // Voice State
  const [voiceState, setVoiceState] = useState<VoiceState>({
    enabled: true,
    autoPlay: false, // user clicks speaker or can toggle autoPlay
    isPlaying: false,
    isPaused: false,
    currentMessageId: null,
    playbackRate: 1.0,
    loadingMessageId: null,
    usingFallback: false,
  });

  // Modals
  const [materialsModalOpen, setMaterialsModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [quizModalOpen, setQuizModalOpen] = useState<boolean>(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Persist materials
  useEffect(() => {
    try {
      localStorage.setItem('chrisella_materials', JSON.stringify(materials));
    } catch (e) {
      console.warn('Could not persist materials:', e);
    }
  }, [materials]);

  // Setup Voice Player Callbacks
  useEffect(() => {
    voicePlayer.setCallbacks({
      onStart: (messageId) => {
        setVoiceState((prev) => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
          currentMessageId: messageId,
          loadingMessageId: null,
        }));
      },
      onPause: () => {
        setVoiceState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: true,
        }));
      },
      onResume: () => {
        setVoiceState((prev) => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
        }));
      },
      onEnd: () => {
        setVoiceState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          currentMessageId: null,
          loadingMessageId: null,
        }));
      },
      onError: () => {
        setVoiceState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          currentMessageId: null,
          loadingMessageId: null,
        }));
      },
    });

    return () => {
      voicePlayer.stop();
    };
  }, []);

  // Save Avatar
  const handleSaveAvatar = (newUrl: string) => {
    setAvatarUrl(newUrl);
    localStorage.setItem('chrisella_avatar', newUrl);
  };

  // Materials Handlers
  const handleAddMaterial = (newMat: LearningMaterial) => {
    setMaterials((prev) => [newMat, ...prev]);
    // Notify in chat
    const notifMsg: ChatMessage = {
      id: 'notif_' + Date.now(),
      sender: 'mentor',
      text: `Materi baru **"${newMat.name}"** telah saya baca dan pelajari (${newMat.charCount.toLocaleString()} karakter). Sekarang materi ini sudah aktif menjadi acuan diskusi kita! Ada bagian tertentu dari materi ini yang ingin langsung kamu tanyakan?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, notifMsg]);
  };

  const handleToggleMaterial = (id: string) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleLoadSample = (sampleType: 'tech' | 'business') => {
    let sampleMat: LearningMaterial;
    if (sampleType === 'tech') {
      sampleMat = {
        id: 'sample_ai_' + Date.now(),
        name: 'Modul_Kuliah_Kecerdasan_Buatan_&_Machine_Learning.pdf',
        type: 'application/pdf',
        size: 324500,
        charCount: 4820,
        summary:
          'Materi dasar Machine Learning: Supervised vs Unsupervised Learning, Algoritma Regresi, Klasifikasi (Decision Tree & SVM), Pengenalan Neural Networks, Loss Function MSE, dan Evaluasi Model (Accuracy, Precision, Recall).',
        content: `MODUL PERKULIAHAN: KECERDASAN BUATAN DAN MACHINE LEARNING
Topik 1: Pengantar Artificial Intelligence
Kecerdasan Buatan (AI) adalah bidang ilmu komputer yang menekankan pada penciptaan mesin cerdas yang bekerja dan bereaksi seperti manusia. Sub-bidang utamanya meliputi Machine Learning (ML), Deep Learning (DL), Natural Language Processing (NLP), dan Computer Vision.

Topik 2: Supervised Learning (Pembelajaran Terawasi)
- Karakteristik: Model dilatih menggunakan dataset yang memiliki label (ground truth target).
- Tugas Utama:
  1. Regresi: Memprediksi nilai kontinu (contoh: prediksi harga rumah, prediksi suhu). Algoritma: Linear Regression, Polynomial Regression. Rumus garis: y = w*x + b.
  2. Klasifikasi: Memprediksi kategori diskret (contoh: deteksi email spam vs non-spam, diagnosa penyakit). Algoritma: Logistic Regression, Decision Tree, Random Forest, Support Vector Machine (SVM).
- Evaluasi Model Klasifikasi:
  - Accuracy = (TP + TN) / (TP + TN + FP + FN)
  - Precision = TP / (TP + FP)
  - Recall = TP / (TP + FN)
  - F1-Score = 2 * (Precision * Recall) / (Precision + Recall)

Topik 3: Unsupervised Learning (Pembelajaran Tanpa Terawasi)
- Karakteristik: Data tidak memiliki label target. Tujuannya menemukan pola intrinsik atau pengelompokan.
- Metode Utama: K-Means Clustering, Hierarchical Clustering, Principal Component Analysis (PCA) untuk reduksi dimensi.

Topik 4: Deep Learning & Neural Network
- Arsitektur: Input Layer -> Hidden Layer(s) -> Output Layer.
- Fungsi Aktivasi: ReLU (f(x) = max(0, x)), Sigmoid (1 / (1 + e^-x)), Softmax untuk multi-kelas.
- Optimasi: Backpropagation menggunakan Gradient Descent dengan Learning Rate alpha.`,
        uploadedAt: new Date().toISOString(),
        active: true,
      };
    } else {
      sampleMat = {
        id: 'sample_biz_' + Date.now(),
        name: 'Modul_Manajemen_Bisnis_&_Keuangan_Digital.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 218400,
        charCount: 3950,
        summary:
          'Studi Manajemen Bisnis: Analisis SWOT, Konsep Marketing Mix 4P & 7P, Analisis Break-Even Point (BEP), Rasio Likuiditas (Current Ratio), Manajemen Arus Kas (Cash Flow), dan Model Bisnis Canvas.',
        content: `MODUL MANAJEMEN BISNIS & KEUANGAN DIGITAL
Bab 1: Perencanaan Strategis & Analisis SWOT
- Strengths (Kekuatan): Keunggulan internal yang membedakan produk di pasar.
- Weaknesses (Kelemahan): Faktor internal yang membatasi kinerja.
- Opportunities (Peluang): Tren pasar eksternal yang menguntungkan.
- Threats (Ancaman): Faktor eksternal yang dapat menimbulkan risiko kerugian.

Bab 2: Analisis Keuangan dan Titik Impas (BEP)
- Rumus Break-Even Point (Unit): BEP = Biaya Tetap (Fixed Cost) / (Harga Jual per Unit - Biaya Variabel per Unit).
- Contribution Margin = Harga Jual - Biaya Variabel.
- Rasio Likuiditas: Current Ratio = Aset Lancar / Liabilitas Lancar (Idealnya >= 1.5 - 2.0).

Bab 3: Bauran Pemasaran (Marketing Mix 4P & 7P)
- 4P: Product, Price, Place, Promotion.
- 7P (Layanan): Ditambah People, Process, Physical Evidence.`,
        uploadedAt: new Date().toISOString(),
        active: true,
      };
    }

    handleAddMaterial(sampleMat);
    setMaterialsModalOpen(false);
  };

  // Voice Controls
  const handlePlayVoice = async (messageId: string, text: string, cachedAudio?: string) => {
    setVoiceState((prev) => ({
      ...prev,
      loadingMessageId: messageId,
    }));
    await voicePlayer.speak(messageId, text, cachedAudio);
    setVoiceState((prev) => ({
      ...prev,
      loadingMessageId: null,
    }));
  };

  const handlePauseVoice = () => {
    voicePlayer.pause();
  };

  const handleResumeVoice = () => {
    voicePlayer.resume();
  };

  const handleStopVoice = () => {
    voicePlayer.stop();
  };

  const handleRateChange = (rate: number) => {
    voicePlayer.setRate(rate);
    setVoiceState((prev) => ({ ...prev, playbackRate: rate }));
  };

  const handleToggleVoiceAuto = () => {
    setVoiceState((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  // Send Message Logic
  const handleSendMessage = async (
    text: string,
    mode: 'chat' | 'explain_more' | 'summarize' | 'practice_questions' | 'quiz' | 'feedback' = 'chat'
  ) => {
    if (!text.trim() || isTyping) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await sendChatMessage(text, messages, materials, mode);
      const mentorMessage: ChatMessage = {
        id: 'men_' + Date.now(),
        sender: 'mentor',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        mode,
      };

      setMessages((prev) => [...prev, mentorMessage]);

      // If Voice Over is enabled, optionally auto-speak new answer
      if (voiceState.enabled && voiceState.autoPlay) {
        handlePlayVoice(mentorMessage.id, mentorMessage.text);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setErrorMessage(err.message || 'Gagal menerima jawaban dari Chrisella Kurniawan.');
      const errReply: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'mentor',
        text: `Mohon maaf, koneksi ke asisten sedang terhambat sebentar: ${err.message}. Silakan coba tanyakan kembali ya!`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errReply]);
    } finally {
      setIsTyping(false);
    }
  };

  // Quick Action Handler
  const handleQuickAction = (
    action: 'explain_more' | 'summarize' | 'practice_questions' | 'quiz' | 'feedback'
  ) => {
    if (action === 'quiz') {
      setQuizModalOpen(true);
      return;
    }

    if (action === 'explain_more') {
      // Find last mentor message or concept
      const lastMentorMsg = [...messages].reverse().find((m) => m.sender === 'mentor');
      const snippet = lastMentorMsg ? lastMentorMsg.text.slice(0, 300) : 'materi pokok';
      handleSendMessage(`Tolong jelaskan konsep ini dengan bahasa yang lebih sederhana dan santai: "${snippet}"`, 'explain_more');
    } else if (action === 'summarize') {
      handleSendMessage('Buatkan rangkuman intisari dari materi pembelajaran yang sudah diunggah.', 'summarize');
    } else if (action === 'practice_questions') {
      handleSendMessage('Buatkan beberapa latihan soal berdasarkan materi untuk menguji pemahamanku.', 'practice_questions');
    } else if (action === 'feedback') {
      handleSendMessage('Saya ingin menguji pemahaman saya tentang materi ini. Bisakah kamu ajukan satu pertanyaan lalu memberikan evaluasi atas jawaban yang saya berikan nanti?', 'feedback');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9FD] text-slate-800">
      {/* 1. Profile Header (Main Focal Area) */}
      <HeaderProfile
        avatarUrl={avatarUrl}
        onOpenPhotoModal={() => setProfileModalOpen(true)}
        materials={materials}
        onOpenMaterialsModal={() => setMaterialsModalOpen(true)}
        voiceState={voiceState}
        onToggleVoice={handleToggleVoiceAuto}
      />

      {/* 2. Interactive Quick Actions Bar */}
      <QuickActionsBar
        onSelectAction={handleQuickAction}
        onOpenMaterials={() => setMaterialsModalOpen(true)}
        disabled={isTyping}
      />

      {/* 3. Main Chat Conversation Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col">
        {/* Messages List */}
        <div className="flex-1 space-y-1">
          {messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              mentorAvatar={avatarUrl}
              voiceState={voiceState}
              onPlayVoice={handlePlayVoice}
              onPauseVoice={handlePauseVoice}
              onResumeVoice={handleResumeVoice}
              onStopVoice={handleStopVoice}
              onExplainSimpler={(text) =>
                handleSendMessage(`Tolong jelaskan bagian ini dengan lebih sederhana: "${text.slice(0, 200)}"`, 'explain_more')
              }
            />
          ))}

          {/* Typing Indicator: "Chrisella Kurniawan is typing…" */}
          {isTyping && (
            <div className="flex items-center gap-3 mb-4 animate-in fade-in duration-200">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-violet-200 shadow-xs shrink-0">
                <img
                  src={avatarUrl}
                  alt="Chrisella Kurniawan"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                  }}
                />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-white border border-violet-100 shadow-xs flex items-center gap-2.5">
                <span className="text-xs font-semibold text-violet-900">
                  Chrisella Kurniawan is typing
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner if any */}
          {errorMessage && (
            <div className="my-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      </main>

      {/* Floating Audio Player Bar (when audio is active) */}
      <AudioPlayerBar
        voiceState={voiceState}
        onPlayResume={handleResumeVoice}
        onPause={handlePauseVoice}
        onStop={handleStopVoice}
        onToggleAutoPlay={() =>
          setVoiceState((prev) => ({ ...prev, autoPlay: !prev.autoPlay }))
        }
        onRateChange={handleRateChange}
      />

      {/* 4. Bottom Chat Input Area */}
      <ChatInputArea
        onSendMessage={(text) => handleSendMessage(text, 'chat')}
        onOpenMaterials={() => setMaterialsModalOpen(true)}
        isLoading={isTyping}
        activeMaterialsCount={materials.filter((m) => m.active).length}
      />

      {/* Modals */}
      <MaterialsModal
        isOpen={materialsModalOpen}
        onClose={() => setMaterialsModalOpen(false)}
        materials={materials}
        onAddMaterial={handleAddMaterial}
        onToggleMaterial={handleToggleMaterial}
        onDeleteMaterial={handleDeleteMaterial}
        onLoadSampleMaterial={handleLoadSample}
      />

      <ProfileEditModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentAvatar={avatarUrl}
        onSaveAvatar={handleSaveAvatar}
      />

      <QuizModal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        materials={materials}
        mentorAvatar={avatarUrl}
        onPlayVoice={handlePlayVoice}
      />
    </div>
  );
}
