import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High body limit for base64 audio and document text
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer memory storage for uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const CHRISELLA_SYSTEM_PROMPT = `
Kamu adalah Chrisella Kurniawan, seorang AI Personal Mentor perempuan yang ramah, komunikatif, sabar, cerdas, dan sangat suportif. Kamu bertindak seperti mentor perempuan tatap muka yang sedang mendampingi mahasiswa/pelajar belajar secara intensif, menyenangkan, dan berbobot.

Karakter & Identitas:
- Nama: Chrisella Kurniawan.
- Peran: Your Personal AI Mentor (Teman belajar dan pembimbing akademik).
- Karakter: Sangat ramah, sabar, komunikatif, suportif, dan berpikiran terbuka.
- Bahasa: Bahasa Indonesia yang natural, hangat, mengalir, dan mudah dipahami (seperti seorang mentor atau dosen muda yang suportif sedang berbicara langsung dengan mahasiswanya).

Aturan Bimbingan & Penggunaan Materi (Knowledge Base):
1. MATERI SEBAGAI SUMBER UTAMA:
   - Gunakan isi "DOKUMEN MATERI PEMBELAJARAN" yang diberikan di bawah ini sebagai sumber rujukan utama dalam menjawab pertanyaan, membuat rangkuman, kuis, atau latihan soal.
   - Pahami secara mendalam konsep, definisi, teori, rumus, diagram, tabel, dan contoh soal yang ada di dalam materi.
   - Jangan pernah memberikan informasi yang bertentangan dengan materi yang telah diunggah.
2. KEJUJURAN AKADEMIK:
   - Jika suatu pertanyaan TIDAK terdapat dalam materi atau belum tercakup di dokumen yang diunggah, kamu HARUS menyampaikan hal tersebut secara jujur dan transparan terlebih dahulu (contoh: "Berdasarkan materi yang kamu unggah, topik atau detail ini belum dibahas secara khusus di sini. Namun, jika kamu ingin pemahaman umum atau pengayaan, saya bisa jelaskan sedikit ya...").
3. PENJELASAN KONKRET & ANALOGI:
   - Selalu berikan contoh nyata atau analogi sederhana agar konsep yang rumit menjadi sangat mudah dipahami.
   - Gunakan format penulisan yang rapi dengan poin-poin jelas (bullet points / numbered list) dan cetak tebal pada istilah kunci.
4. LATIHAN & FEEDBACK:
   - Saat memberikan soal latihan atau kuis, buatlah bertahap dari pemahaman dasar hingga analisis.
   - Saat memeriksa jawaban pengguna, beri apresiasi pada usahanya, jelaskan bagian yang sudah tepat, lalu koreksi kekeliruan dengan santun beserta penjelasan logisnya.
`;

// Helper to strip markdown symbols for natural TTS speech
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, 'blok kode')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*#_~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[\r\n]+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

// API Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    mentor: 'Chrisella Kurniawan',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// API: Download Project Source Code ZIP
app.get('/api/download-zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'public', 'chrisella-kurniawan-ai-mentor.zip');
  res.download(zipPath, 'chrisella-kurniawan-ai-mentor.zip', (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: 'File zip proyek tidak ditemukan.' });
    }
  });
});

// API: Upload and process learning material
app.post('/api/upload-material', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
    }

    const fileName = file.originalname;
    const mimeType = file.mimetype;
    const fileSize = file.size;
    let extractedText = '';
    let summary = '';

    const lowerName = fileName.toLowerCase();

    // Text / Markdown files
    if (
      mimeType.startsWith('text/') ||
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.md') ||
      lowerName.endsWith('.json') ||
      lowerName.endsWith('.csv')
    ) {
      extractedText = file.buffer.toString('utf-8');
      summary = `Dokumen teks berisi ${extractedText.length} karakter.`;
    }
    // DOCX files via mammoth
    else if (
      lowerName.endsWith('.docx') ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = result.value || '';
        summary = `Dokumen Word berhasil diekstrak (${extractedText.length} karakter).`;
      } catch (err: any) {
        console.error('Error parsing docx:', err);
        extractedText = `[Gagal membaca teks otomatis dari DOCX: ${err.message}]`;
      }
    }
    // PDF files
    else if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
      const ai = getGeminiClient();
      if (ai) {
        try {
          // Use Gemini 3.8 Flash to extract and summarize full text accurately
          const base64Pdf = file.buffer.toString('base64');
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: 'application/pdf',
                      data: base64Pdf,
                    },
                  },
                  {
                    text: 'Ekstrak seluruh teks penting, konsep utama, definisi, teori, rumus, tabel, dan contoh soal dari dokumen PDF ini secara lengkap dan terstruktur dalam Bahasa Indonesia.',
                  },
                ],
              },
            ],
          });
          extractedText = response.text || '';
          summary = `Dokumen PDF diproses oleh Chrisella Kurniawan (${extractedText.length} karakter konsep diekstrak).`;
        } catch (err: any) {
          console.warn('Gemini PDF extraction fallback:', err.message);
          extractedText = `[Dokumen PDF ${fileName} (Ukuran: ${(fileSize / 1024).toFixed(1)} KB). AI akan menganalisis konten saat berdiskusi]`;
          summary = `Dokumen PDF (${(fileSize / 1024).toFixed(1)} KB)`;
        }
      } else {
        extractedText = `[Dokumen PDF ${fileName} berhasil diunggah (${(fileSize / 1024).toFixed(1)} KB). Tambahkan GEMINI_API_KEY untuk analisis mendalam.]`;
        summary = `Dokumen PDF (${(fileSize / 1024).toFixed(1)} KB)`;
      }
    }
    // Images (PNG, JPG, WEBP)
    else if (mimeType.startsWith('image/')) {
      const ai = getGeminiClient();
      if (ai) {
        try {
          const base64Img = file.buffer.toString('base64');
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType as any,
                      data: base64Img,
                    },
                  },
                  {
                    text: 'Jelaskan dan ekstrak seluruh informasi, diagram, teks, rumus, atau konsep materi belajar yang terdapat dalam gambar ini secara mendalam dalam Bahasa Indonesia.',
                  },
                ],
              },
            ],
          });
          extractedText = response.text || '';
          summary = `Gambar materi belajar berhasil dianalisis oleh Chrisella Kurniawan.`;
        } catch (err: any) {
          console.warn('Gemini Image extraction fallback:', err.message);
          extractedText = `[Gambar materi: ${fileName}]`;
          summary = `File gambar (${(fileSize / 1024).toFixed(1)} KB)`;
        }
      } else {
        extractedText = `[Gambar materi: ${fileName} (${(fileSize / 1024).toFixed(1)} KB)]`;
        summary = `File gambar`;
      }
    }
    // PPT / PPTX or other formats
    else {
      // Try text representation or fallback
      extractedText = `[File materi presentasi/dokumen: ${fileName} (${(fileSize / 1024).toFixed(1)} KB)]`;
      summary = `Dokumen materi pembelajaran (${(fileSize / 1024).toFixed(1)} KB)`;
    }

    // Generate quick 2-sentence summary if we have long text and Gemini is available
    if (extractedText.length > 200 && getGeminiClient()) {
      try {
        const ai = getGeminiClient()!;
        const sumResp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Buat ringkasan 1-2 kalimat padat dan jelas tentang isi materi berikut untuk pengantar mentor Chrisella Kurniawan:\n\n${extractedText.slice(0, 3000)}`,
        });
        if (sumResp.text) {
          summary = sumResp.text.trim();
        }
      } catch (e) {
        // keep existing summary
      }
    }

    const material = {
      id: 'mat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: fileName,
      type: mimeType || 'application/octet-stream',
      size: fileSize,
      charCount: extractedText.length,
      summary: summary || `Materi ${fileName} telah siap digunakan.`,
      content: extractedText,
      uploadedAt: new Date().toISOString(),
      active: true,
    };

    return res.json({ success: true, material });
  } catch (error: any) {
    console.error('Upload material error:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses file materi.' });
  }
});

// API: Chat with Chrisella Kurniawan
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], materials = [], mode = 'chat' } = req.body;

    if (!message && mode === 'chat') {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
    }

    const ai = getGeminiClient();

    // Prepare Active Materials text
    const activeMaterials = materials.filter((m: any) => m.active !== false);
    let materialsContext = '';
    if (activeMaterials.length > 0) {
      materialsContext = `\n\n=== DOKUMEN MATERI PEMBELAJARAN YANG DIUNGGAH OLEH PENGGUNA ===\n`;
      activeMaterials.forEach((m: any, index: number) => {
        materialsContext += `\n[Materi #${index + 1}: ${m.name}]\n${m.content || m.summary}\n`;
      });
      materialsContext += `\n=== AKHIR DOKUMEN MATERI PEMBELAJARAN ===\nINGAT: Gunakan materi di atas sebagai sumber utama kamu dalam menjawab!`;
    } else {
      materialsContext = `\n\n[Catatan: Belum ada dokumen materi eksternal yang diunggah oleh pengguna saat ini. Jika pengguna bertanya tentang topik belajar umum, bantu jelaskan dengan ramah, dan ingatkan bahwa mereka juga bisa mengunggah file PDF, DOCX, PPT, atau gambar materi belajar kapan saja.]`;
    }

    const fullSystemInstruction = CHRISELLA_SYSTEM_PROMPT + materialsContext;

    if (!ai) {
      // Local graceful fallback if no API key yet
      return res.json({
        reply: `Halo! Saya Chrisella Kurniawan, mentor pribadi kamu. Senang sekali bisa mendampingimu belajar hari ini!\n\nUntuk mengaktifkan kecerdasan penuh AI saya dalam menganalisis materi dan memberikan jawaban mendalam secara otomatis, silakan pastikan API Key Gemini sudah terhubung di menu **Settings > Secrets**.\n\nSementara itu, kamu bisa mulai mengunggah file materi belajarmu (PDF, DOCX, PPTX, atau Gambar) lewat tombol di atas, atau tanyakan apapun seputar topik yang ingin kamu pelajari!`,
        mode,
      });
    }

    // Build chat conversation for Gemini
    const contents: any[] = [];

    // Include recent history (last 10 turns)
    const recentHistory = history.slice(-10);
    for (const h of recentHistory) {
      if (h.sender === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: h.text }],
        });
      } else if (h.sender === 'mentor') {
        contents.push({
          role: 'model',
          parts: [{ text: h.text }],
        });
      }
    }

    // Add current user prompt
    let userPrompt = message;
    if (mode === 'explain_more') {
      userPrompt = `Tolong jelaskan kembali materi/konsep yang baru saja kita bahas dengan cara yang jauh lebih sederhana, santai, dan menggunakan analogi kehidupan sehari-hari agar aku lebih mudah memahaminya. Pertanyaan atau topik: ${message || 'konsep materi terakhir'}`;
    } else if (mode === 'summarize') {
      userPrompt = `Buatkan rangkuman komprehensif dari materi pembelajaran yang sudah diunggah. Buat dalam format:
1. Poin-Poin Kunci & Intisari Materi
2. Konsep & Definisi Penting
3. Rumus / Teori / Struktur Pokok (jika ada)
4. Contoh Penerapan & Tips Belajar
Sajikan dengan gaya penjelasan Chrisella Kurniawan yang komunikatif dan terstruktur.`;
    } else if (mode === 'practice_questions') {
      userPrompt = `Buatkan 3 sampai 4 latihan soal berdasarkan materi pembelajaran yang diunggah. Sertakan variasi tingkat kesulitan (mudah, sedang, menantang). Untuk setiap soal, jangan langsung berikan jawabannya, tapi sediakan petunjuk/clue berpikir, lalu di bagian bawah sediakan kunci jawaban dan pembahasan rinci yang bisa aku cek setelah mencoba menjawab.`;
    } else if (mode === 'quiz') {
      userPrompt = `Buatkan satu paket Kuis Interaktif (3 pertanyaan pilihan ganda atau isian) berdasarkan materi yang diunggah untuk menguji pemahamanku sekarang. Sajikan pertanyaan pertama sekarang dengan pilihan opsi A, B, C, D dan minta aku memilih jawabannya!`;
    } else if (mode === 'feedback') {
      userPrompt = `Tolong berikan evaluasi, feedback konstruktif, dan koreksi mendalam terhadap jawabanku berikut ini berdasarkan materi belajar kita:\n\n"${message}"\n\nTunjukkan apa yang sudah benar, apa yang perlu disempurnakan, dan berikan tips agar pemahamanku semakin matang.`;
    }

    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: fullSystemInstruction,
      },
    });

    const reply = response.text || 'Maaf, saya sedang memproses pikiran saya. Bisakah kamu ulangi pertanyaannya?';

    return res.json({
      reply,
      mode,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: error.message || 'Terjadi kendala saat menghubungi Chrisella Kurniawan.',
    });
  }
});

// API: Voice Over (TTS) using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Teks untuk suara tidak boleh kosong.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Layanan suara Gemini memerlukan API Key. Sistem akan menggunakan browser TTS sebagai cadangan otomatis.',
        useClientFallback: true,
      });
    }

    // Clean text and take up to 800 characters for high speed and natural flow
    const cleanSpeech = cleanTextForSpeech(text).slice(0, 1000);

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanSpeech,
              speechMetadata: {
                style: 'Bicara dengan suara perempuan Indonesia yang ramah, hangat, tenang, percaya diri, dan komunikatif seperti mentor perempuan yang membimbing mahasiswa.',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({
        error: 'Tidak menerima data audio dari Gemini TTS.',
        useClientFallback: true,
      });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.warn('TTS error (will trigger client fallback):', error.message);
    return res.status(500).json({
      error: error.message || 'Gagal menghasilkan suara.',
      useClientFallback: true,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chrisella Kurniawan Mentor Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
