import { ChatMessage, LearningMaterial } from '../types';

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  materials: LearningMaterial[],
  mode: 'chat' | 'explain_more' | 'summarize' | 'practice_questions' | 'quiz' | 'feedback' = 'chat'
): Promise<{ reply: string; mode: string }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history: history.map((m) => ({
        sender: m.sender,
        text: m.text,
      })),
      materials,
      mode,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Gagal mengirim pesan (HTTP ${response.status})`);
  }

  return response.json();
}

export async function requestTTS(text: string): Promise<{ audioBase64?: string; useClientFallback?: boolean }> {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    if (!response.ok || data.useClientFallback) {
      return { useClientFallback: true };
    }

    return { audioBase64: data.audioBase64 };
  } catch (error) {
    console.warn('TTS request error, opting for browser fallback:', error);
    return { useClientFallback: true };
  }
}

export async function uploadMaterialFile(file: File): Promise<LearningMaterial> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload-material', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Gagal mengunggah file ${file.name}`);
  }

  const data = await response.json();
  return data.material;
}
