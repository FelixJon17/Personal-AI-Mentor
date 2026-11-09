import { requestTTS } from './api';

export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*#_~]/g, '') // remove markdown markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[-+*]\s+/g, '') // remove bullet points markers
    .replace(/\b(https?:\/\/[^\s]+)/g, '')
    .replace(/[\r\n]+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

type VoiceCallback = {
  onStart: (messageId: string) => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onError: (err: any) => void;
};

class VoicePlayer {
  private audio: HTMLAudioElement | null = null;
  private currentMessageId: string | null = null;
  private currentRate: number = 1.0;
  private callbacks: Partial<VoiceCallback> = {};
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private mode: 'gemini' | 'browser' | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.addEventListener('play', () => {
        this.callbacks.onResume?.();
      });
      this.audio.addEventListener('pause', () => {
        if (this.audio && !this.audio.ended) {
          this.callbacks.onPause?.();
        }
      });
      this.audio.addEventListener('ended', () => {
        this.currentMessageId = null;
        this.callbacks.onEnd?.();
      });
      this.audio.addEventListener('error', (e) => {
        console.warn('Audio playback error:', e);
        this.callbacks.onError?.(e);
      });
    }
  }

  public setCallbacks(cb: Partial<VoiceCallback>) {
    this.callbacks = cb;
  }

  public setRate(rate: number) {
    this.currentRate = rate;
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
    if (this.activeUtterance && 'speechSynthesis' in window) {
      // Browser speech rate cannot be dynamically altered mid-utterance reliably, but is saved for next
    }
  }

  public getCurrentMessageId(): string | null {
    return this.currentMessageId;
  }

  public isPlaying(): boolean {
    if (this.mode === 'gemini' && this.audio) {
      return !this.audio.paused && !this.audio.ended;
    }
    if (this.mode === 'browser' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking && !window.speechSynthesis.paused;
    }
    return false;
  }

  public isPaused(): boolean {
    if (this.mode === 'gemini' && this.audio) {
      return this.audio.paused && !this.audio.ended && this.audio.currentTime > 0;
    }
    if (this.mode === 'browser' && 'speechSynthesis' in window) {
      return window.speechSynthesis.paused;
    }
    return false;
  }

  public pause() {
    if (this.mode === 'gemini' && this.audio) {
      this.audio.pause();
      this.callbacks.onPause?.();
    } else if (this.mode === 'browser' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      this.callbacks.onPause?.();
    }
  }

  public resume() {
    if (this.mode === 'gemini' && this.audio) {
      this.audio.play();
      this.callbacks.onResume?.();
    } else if (this.mode === 'browser' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      this.callbacks.onResume?.();
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentMessageId = null;
    this.mode = null;
    this.callbacks.onEnd?.();
  }

  public async speak(messageId: string, text: string, cachedBase64?: string): Promise<void> {
    this.stop();
    this.currentMessageId = messageId;
    const clean = cleanTextForSpeech(text);
    if (!clean) return;

    // 1. If we already have base64 audio from Gemini TTS
    if (cachedBase64) {
      this.playBase64(messageId, cachedBase64);
      return;
    }

    // 2. Request Gemini TTS from server
    try {
      const res = await requestTTS(clean);
      if (res.audioBase64) {
        this.playBase64(messageId, res.audioBase64);
        return;
      }
    } catch (err) {
      console.warn('Server TTS failed, falling back to Web Speech API:', err);
    }

    // 3. Fallback to Browser SpeechSynthesis (Natural Indonesian female voice setting)
    this.playBrowserTTS(messageId, clean);
  }

  private playBase64(messageId: string, base64: string) {
    if (!this.audio) return;
    this.mode = 'gemini';
    this.currentMessageId = messageId;
    this.audio.src = `data:audio/wav;base64,${base64}`;
    this.audio.playbackRate = this.currentRate;
    this.callbacks.onStart?.(messageId);
    this.audio.play().catch((err) => {
      console.warn('Audio play failed, falling back to browser:', err);
      const clean = cleanTextForSpeech(this.audio?.src || '');
      this.playBrowserTTS(messageId, clean);
    });
  }

  private playBrowserTTS(messageId: string, text: string) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      this.currentMessageId = null;
      this.callbacks.onEnd?.();
      return;
    }

    this.mode = 'browser';
    this.currentMessageId = messageId;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = this.currentRate * 0.95;
    utterance.pitch = 1.12; // Natural female pitch

    // Try finding an Indonesian female voice if available in browser
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(
      (v) =>
        (v.lang === 'id-ID' || v.lang.startsWith('id')) &&
        (v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('gadis') ||
          v.name.toLowerCase().includes('indonesia'))
    ) || voices.find((v) => v.lang === 'id-ID' || v.lang.startsWith('id'));

    if (idVoice) {
      utterance.voice = idVoice;
    }

    utterance.onstart = () => {
      this.callbacks.onStart?.(messageId);
    };

    utterance.onend = () => {
      this.currentMessageId = null;
      this.mode = null;
      this.callbacks.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.currentMessageId = null;
      this.mode = null;
      this.callbacks.onEnd?.();
    };

    this.activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }
}

export const voicePlayer = new VoicePlayer();
