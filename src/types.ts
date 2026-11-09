export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
  mode?: 'chat' | 'explain_more' | 'summarize' | 'practice_questions' | 'quiz' | 'feedback';
  audioBase64?: string;
  isAudioLoading?: boolean;
}

export interface LearningMaterial {
  id: string;
  name: string;
  type: string;
  size: number;
  charCount: number;
  summary: string;
  content: string;
  uploadedAt: string;
  active: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VoiceState {
  enabled: boolean;
  autoPlay: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentMessageId: string | null;
  playbackRate: number; // 0.8, 1.0, 1.25
  loadingMessageId: string | null;
  usingFallback: boolean;
}
