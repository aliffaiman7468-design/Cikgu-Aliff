import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDistDir(): string {
  const possiblePaths = [
    path.resolve(__dirname, 'dist'), // when running server.ts from workspace root
    path.resolve(process.cwd(), 'dist'), // when running from cwd
    __dirname, // when server.js is running inside dist/
    path.resolve(__dirname, '..', 'dist'),
  ];
  for (const p of possiblePaths) {
    const indexPath = path.resolve(p, 'index.html');
    if (fs.existsSync(indexPath)) {
      // Prioritize directory that has index.html and either ends with dist or has assets folder
      if (p.endsWith('dist') || fs.existsSync(path.resolve(p, 'assets'))) {
        return p;
      }
    }
  }
  return path.resolve(process.cwd(), 'dist');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Endpoint: Assist Teacher in generating comic scenes & assessment questions
app.post('/api/ai/generate-comic', async (req, res) => {
  try {
    const { topic, tahap, characterNames, setting } = req.body;
    
    const prompt = `Anda adalah Sensei BM, pakar pedagogi Bahasa Melayu Sekolah Rendah Malaysia (DSKP KSSR Semakan).
Sila hasilkan satu cerita komik/manga pendidikan Bahasa Melayu berserta soalan latihan objektif.

Maklumat Permintaan:
- Tajuk / Fokus Tatabahasa: ${topic || 'Kata Nama dan Kata Kerja'}
- Tahap Murid: ${tahap || 'Tahap 1 (Tahun 1-3)'}
- Watak Utama: ${characterNames || 'Ali dan Siti'}
- Latar Tempat: ${setting || 'Kawasan Sekolah'}

Sila hasilkan dalam format JSON yang mengandungi:
1. "title": Tajuk komik yang menarik dan bersemangat.
2. "synopsis": Sinopsis ringkas 1-2 ayat.
3. "tahap": "${tahap || 'Tahap 1'}"
4. "theme": Fokus tatabahasa / topik.
5. "panels": Senarai 3 hingga 4 panel komik. Setiap panel mengandungi:
   - "panelNumber": nombor panel (1, 2, 3...)
   - "description": Penerangan visual aksi watak dalam panel manga (contoh: Ali sedang menghulurkan bantuan dengan senyuman ceria).
   - "dialogue": Dialog penuh watak dalam panel (contoh: Ali: "Sila ambil buku ini, Siti!").
   - "soundEffect": Kesan bunyi komik (contoh: "Zzzap!", "Woshh!", "Tap tap!").
6. "questions": 3 soalan aneka pilihan (MCQ) yang berkait terus dengan dialog atau jalan cerita panel. Setiap soalan ada:
   - "id": string unik (contoh: "q1")
   - "question": Teks soalan yang jelas dan tepat.
   - "panelRef": Nombor panel yang berkaitan (contoh: 1 atau 2).
   - "options": Array 4 pilihan jawapan (format: ["A) ...", "B) ...", "C) ...", "D) ..."]).
   - "correctOption": Huruf jawapan betul ("A", "B", "C", atau "D").
   - "explanationTahap1": Penerangan ringkas, santai, dan ada kesan bunyi ceria jika murid buat silap.
   - "explanationTahap2": Huraian tatabahasa yang tepat mengikut rumus DSKP.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            synopsis: { type: Type.STRING },
            tahap: { type: Type.STRING },
            theme: { type: Type.STRING },
            panels: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  panelNumber: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  dialogue: { type: Type.STRING },
                  soundEffect: { type: Type.STRING },
                },
                required: ['panelNumber', 'description', 'dialogue'],
              },
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  panelRef: { type: Type.INTEGER },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctOption: { type: Type.STRING },
                  explanationTahap1: { type: Type.STRING },
                  explanationTahap2: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctOption', 'explanationTahap1', 'explanationTahap2'],
              },
            },
          },
          required: ['title', 'synopsis', 'tahap', 'theme', 'panels', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating comic:', error);
    return res.status(500).json({ success: false, error: error.message || 'Gagal menjana bahan komik.' });
  }
});

// AI Endpoint: Ask Sensei BM for interactive hints / grammar consultation
app.post('/api/ai/ask-sensei', async (req, res) => {
  try {
    const { question, userLevel, contextText } = req.body;
    
    const prompt = `Anda adalah Sensei BM, guru Bahasa Melayu yang penuh semangat, mesra, dan berjiwa komik/manga untuk murid sekolah rendah Malaysia.
Murid sedang bertanya atau memerlukan bantuan tatabahasa.

Tahap Murid: ${userLevel || 'Tahap 1'}
Konteks Dialog/Cerita: ${contextText || 'Umum'}
Soalan / Pertanyaan: ${question}

Gaya jawapan:
1. Jika murid Tahap 1: Gunakan ayat pendek, ceria, perkataan mudah difahami, dan selitkan kesan bunyi manga seperti *Zzzap!*, *Gempak!*, atau *Chup!*.
2. Jika murid Tahap 2: Berikan Huraian Tatabahasa yang padat, terang, dan berikan 1 contoh ayat lain sebagai pengukuhan.
3. Nada: Jangan sesekali merendahkan murid. Sentiasa beri motivasi wira BM!

Berikan jawapan dalam Bahasa Melayu standard yang mesra.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ success: true, answer: response.text });
  } catch (error: any) {
    console.error('Error in ask-sensei:', error);
    return res.status(500).json({ success: false, error: error.message || 'Sensei BM sedang meneliti kamus!' });
  }
});

// Endpoint to download the entire project zip
app.get('/api/download-project', (_req, res) => {
  const possiblePaths = [
    path.resolve(__dirname, 'sensei-bm-projek-lengkap.zip'),
    path.resolve(__dirname, 'dist', 'sensei-bm-projek-lengkap.zip'),
    path.resolve(__dirname, 'public', 'sensei-bm-projek-lengkap.zip'),
    path.resolve(process.cwd(), 'sensei-bm-projek-lengkap.zip'),
    path.resolve(process.cwd(), 'dist', 'sensei-bm-projek-lengkap.zip'),
    path.resolve(process.cwd(), 'public', 'sensei-bm-projek-lengkap.zip'),
  ];
  for (const z of possiblePaths) {
    if (fs.existsSync(z)) {
      return res.download(z, 'sensei-bm-projek-lengkap.zip');
    }
  }
  return res.status(404).send('Fail ZIP projek sedang disediakan. Sila cuba sebentar lagi.');
});

async function startServer() {
  const isDev = process.env.NODE_ENV === 'development' || process.env.npm_lifecycle_event === 'dev';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = getDistDir();
    console.log(`Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === 'GET' || req.method === 'HEAD') {
        const indexPath = path.resolve(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
      }
      next();
    });
  }

  const host = '0.0.0.0';
  app.listen(Number(PORT), host, () => {
    console.log(`Sensei BM Server running on http://${host}:${PORT}`);
  });
}

startServer();
