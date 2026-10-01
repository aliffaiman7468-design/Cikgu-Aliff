import React, { useState } from 'react';
import { ComicStory, ComicPanel, Question, TahapLevel } from '../types/comic';
import { formatFileSize, generateSampleComicPdf } from '../utils/pdfHelper';
import { dataUrlToBlobUrl } from '../utils/pdfRenderer';
import { ComicCoverDisplay } from './ComicCoverDisplay';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Sparkles,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  HelpCircle,
  FileCheck,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface QuickComicUploaderProps {
  onSaveAndPublish: (comic: ComicStory) => Promise<void>;
  onCancel: () => void;
  onPreviewSamplePdf?: () => void;
}

export const QuickComicUploader: React.FC<QuickComicUploaderProps> = ({
  onSaveAndPublish,
  onCancel,
}) => {
  const [uploadMode, setUploadMode] = useState<'pdf' | 'manga_images'>('pdf');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [tahap, setTahap] = useState<TahapLevel>('Tahap 1');
  const [yearLevel, setYearLevel] = useState('Tahun 2');
  const [topic, setTopic] = useState('Kata Sopan & Pertuturan Harian');
  const [dskpCode, setDskpCode] = useState('SK 5.1 / SP 5.1.4');

  // PDF Data
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState('');
  const [pdfFileType, setPdfFileType] = useState('application/pdf');

  // Manga Images Data
  const [uploadedPanels, setUploadedPanels] = useState<ComicPanel[]>([]);

  // Cover Image
  const [coverType, setCoverType] = useState<'image' | 'pdf'>('image');
  const [coverImage, setCoverImage] = useState(
    '/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg'
  );
  const [coverChoice, setCoverChoice] = useState<'preset' | 'pdf_auto' | 'custom_image'>('preset');

  // Questions Configuration
  const [includeQuestions, setIncludeQuestions] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: `q-quick-1`,
      panelRef: 1,
      question: 'Apakah amalan budi bahasa yang ditunjukkan dalam komik ini?',
      options: [
        'A) Menggunakan kata sopan ketika berbicara',
        'B) Memotong percakapan orang lain',
        'C) Berkelakuan kasar dengan rakan',
        'D) Tidak mempedulikan orang sekeliling',
      ],
      correctOption: 'A',
      explanationTahap1: 'Zzzap! Tepat sekali! Berbicara dengan kata sopan menunjukkan akhlak terpuji!',
      explanationTahap2: 'Kesantunan berbahasa mencerminkan amalan nilai murni mengikut kemahiran DSKP Bahasa Melayu.',
    },
  ]);

  // Handle PDF file selection
  const handleProcessPdf = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Sila pilih fail berformat PDF (.pdf) sahaja.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('Saiz fail PDF melebihi 25MB. Sila mampatkan fail PDF anda.');
      return;
    }

    setErrorMessage('');
    setIsProcessingFile(true);
    setProcessingStatus('Sedang membaca dan memproses dokumen fail PDF...');

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPdfUrl(dataUrl);
      setPdfFileName(file.name);
      setPdfFileSize(formatFileSize(file.size));
      setPdfFileType(file.type || 'application/pdf');

      // Auto-extract clean title from file name if title is empty or generic
      const cleanTitle = file.name
        .replace(/\.pdf$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      setTitle(cleanTitle);
      if (!synopsis) {
        setSynopsis(`Bahan bacaan komik pembelajaran Bahasa Melayu: ${cleanTitle}.`);
      }

      // Set cover to PDF
      setCoverType('pdf');
      setCoverImage(dataUrl);
      setCoverChoice('pdf_auto');

      setIsProcessingFile(false);
      setProcessingStatus('');
    };

    reader.onerror = () => {
      setIsProcessingFile(false);
      setErrorMessage('Gagal membaca fail PDF. Sila cuba lagi atau pilih fail lain.');
    };

    reader.readAsDataURL(file);
  };

  // Handle Manga multiple images upload
  const handleProcessMangaImages = (files: FileList) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setErrorMessage('Tiada fail imej (PNG, JPG, WebP) yang sah dipilih.');
      return;
    }

    setErrorMessage('');
    setIsProcessingFile(true);
    setProcessingStatus(`Sedang memproses ${validFiles.length} panel gambar manga...`);

    const newPanels: ComicPanel[] = [];
    let loaded = 0;

    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        newPanels[index] = {
          id: `panel-manga-${Date.now()}-${index}`,
          panelNumber: index + 1,
          imageUrl: dataUrl,
          characterName: `Watak Babak ${index + 1}`,
          dialogue: `Dialog watak bagi halaman ${index + 1}...`,
          soundEffect: index === 0 ? 'Zzzap! Mula!' : 'Woshh!',
          narration: `Babak ${index + 1}: Perjalanan cerita manga Bahasa Melayu.`,
        };
        loaded++;

        if (loaded === validFiles.length) {
          setUploadedPanels(newPanels);
          // Set first image as cover
          if (newPanels[0]?.imageUrl) {
            setCoverImage(newPanels[0].imageUrl);
            setCoverType('image');
          }
          if (!title) {
            const cleanTitle = validFiles[0].name
              .replace(/\.[^/.]+$/, '')
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase());
            setTitle(`Manga BM: ${cleanTitle}`);
          }
          setIsProcessingFile(false);
          setProcessingStatus('');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Use Sample PDF
  const handleLoadSample = () => {
    const sample = generateSampleComicPdf();
    setPdfUrl(sample);
    setPdfFileName('Komik_Adab_Bahasa_Melayu_Contoh.pdf');
    setPdfFileSize('12.5 KB');
    setPdfFileType('application/pdf');
    setTitle('Komik Adab & Kesantunan Bahasa Melayu (E-Komik)');
    setSynopsis('Kisah teladan Ali dan Siti mengamalkan kesantunan berbahasa.');
    setCoverType('pdf');
    setCoverImage(sample);
    setCoverChoice('pdf_auto');
  };

  // Add Question
  const handleAddQuestion = () => {
    const nextNo = questions.length + 1;
    setQuestions([
      ...questions,
      {
        id: `q-quick-${Date.now()}`,
        panelRef: 1,
        question: `Soalan ${nextNo}: Apakah maksud tersurat atau tersirat yang dipelajari?`,
        options: [
          'A) Pilihan Jawapan Tepat',
          'B) Pilihan Pengganggu 1',
          'C) Pilihan Pengganggu 2',
          'D) Pilihan Pengganggu 3',
        ],
        correctOption: 'A',
        explanationTahap1: 'Gempak! Jawapan kamu sangat tepat, wira cilik!',
        explanationTahap2: 'Jawapan bertepatan dengan kefahaman teks dan hukum tatabahasa DSKP.',
      },
    ]);
  };

  // Update Question Option
  const handleUpdateOption = (qIdx: number, optIdx: number, val: string) => {
    const copy = [...questions];
    const opts = [...copy[qIdx].options];
    opts[optIdx] = val;
    copy[qIdx].options = opts;
    setQuestions(copy);
  };

  // Final Publish Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Sila masukkan tajuk komik anda.');
      return;
    }

    if (uploadMode === 'pdf' && !pdfUrl) {
      setErrorMessage('Sila pilih atau muat naik fail PDF komik anda terlebih dahulu.');
      return;
    }

    if (uploadMode === 'manga_images' && uploadedPanels.length === 0) {
      setErrorMessage('Sila pilih sekurang-kurangnya satu imej panel manga.');
      return;
    }

    setIsPublishing(true);
    setErrorMessage('');

    try {
      const finalPanels: ComicPanel[] =
        uploadMode === 'manga_images'
          ? uploadedPanels
          : [
              {
                id: `p-pdf-${Date.now()}`,
                panelNumber: 1,
                imageUrl: coverChoice === 'preset' ? coverImage : undefined,
                characterName: 'Sensei BM',
                dialogue: 'Hayatilah bahan komik PDF ini dengan teliti.',
                soundEffect: 'Bismillah! Baca!',
                narration: 'Bahan bacaan komik interaktif dalam format dokumen PDF.',
              },
            ];

      const newComic: ComicStory = {
        id: `comic-upload-${Date.now()}`,
        title: title.trim(),
        synopsis: synopsis.trim() || 'Bahan bacaan komik pembelajaran Bahasa Melayu yang menarik.',
        coverImage: coverImage,
        coverType: coverType,
        coverPdfFileName: coverType === 'pdf' ? (pdfFileName || 'Muka_Depan.pdf') : undefined,
        tahap,
        yearLevel,
        topic: topic.trim() || 'Tatabahasa & Kefahaman',
        dskpCode: dskpCode.trim() || 'DSKP KSSR Semakan',
        comicFormat: uploadMode === 'pdf' ? 'pdf' : 'panels',
        pdfUrl: uploadMode === 'pdf' ? pdfUrl : undefined,
        pdfFileName: uploadMode === 'pdf' ? pdfFileName : undefined,
        pdfFileSize: uploadMode === 'pdf' ? pdfFileSize : undefined,
        pdfUploadDate: new Date().toLocaleDateString('ms-MY', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        pdfFileType: uploadMode === 'pdf' ? pdfFileType : undefined,
        panels: finalPanels,
        questions: includeQuestions ? questions : [],
        isPublished: true, // Always immediately active and visible in Murid Portal!
        createdAt: new Date().toISOString().split('T')[0],
        author: 'Cikgu (Karya Asal Guru)',
      };

      await onSaveAndPublish(newComic);
    } catch (err: any) {
      console.error('Error during quick publish:', err);
      setErrorMessage('Ralat semasa menerbitkan komik: ' + (err.message || 'Sila cuba lagi.'));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-lg space-y-8">
      {/* Header */}
      <div className="border-b border-amber-100 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2 border border-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Penerbitan Terus ke Portal Murid
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Muat Naik Komik Sendiri (PDF / Gambar Manga)
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
          Muat naik karya komik anda dalam sekelip mata! Apabila diterbitkan, komik ini akan{' '}
          <strong className="text-emerald-700">muncul serta-merta di Portal Murid</strong> untuk murid membaca dan menjawab soalan latihan.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Pilih Format Fail */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Langkah 1: Pilih Format Komik yang Ingin Dimuat Naik
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option A: PDF */}
          <button
            type="button"
            onClick={() => {
              setUploadMode('pdf');
              setCoverType(pdfUrl ? 'pdf' : 'image');
            }}
            className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${
              uploadMode === 'pdf'
                ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-400 shadow-sm'
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
            }`}
          >
            <div
              className={`p-3 rounded-2xl shrink-0 ${
                uploadMode === 'pdf' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-slate-900 block">
                Fail Dokumen PDF (.pdf)
              </span>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Sesuai untuk komik Canva, fail e-buku, modul komik bertahap, atau imbasan komik dalam 1 fail PDF lengkap.
              </p>
              {pdfUrl && (
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  <CheckCircle className="w-3 h-3" /> Fail PDF Dipilih ({pdfFileSize})
                </span>
              )}
            </div>
          </button>

          {/* Option B: Manga Images */}
          <button
            type="button"
            onClick={() => {
              setUploadMode('manga_images');
              setCoverType('image');
            }}
            className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${
              uploadMode === 'manga_images'
                ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400 shadow-sm'
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
            }`}
          >
            <div
              className={`p-3 rounded-2xl shrink-0 ${
                uploadMode === 'manga_images' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
              }`}
            >
              <ImageIcon className="w-7 h-7" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-slate-900 block">
                Siri Gambar Manga (PNG / JPG)
              </span>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pilih satu atau berpuluh gambar panel manga sekaligus. Sistem akan menyusunnya mengikut turutan Panel 1, 2, 3!
              </p>
              {uploadedPanels.length > 0 && (
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  <CheckCircle className="w-3 h-3" /> {uploadedPanels.length} Panel Gambar Dimuat Naik
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Step 2: Dropzone Fail */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Langkah 2: Pilih / Tarik Fail Komik dari Komputer Anda
        </label>

        {isProcessingFile ? (
          <div className="p-8 rounded-2xl border-2 border-dashed border-indigo-400 bg-indigo-50 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
            <p className="text-xs font-bold text-indigo-900">{processingStatus}</p>
            <span className="text-[11px] text-indigo-600 mt-1">Sila tunggu sebentar...</span>
          </div>
        ) : uploadMode === 'pdf' ? (
          /* PDF Dropzone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleProcessPdf(e.dataTransfer.files[0]);
              }
            }}
            className={`border-3 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50 scale-[0.99]'
                : pdfUrl
                ? 'border-emerald-300 bg-emerald-50/20'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              id="quick-pdf-input"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProcessPdf(e.target.files[0]);
                }
              }}
            />

            {pdfUrl ? (
              <div className="space-y-3">
                <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300">
                  <FileCheck className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block mb-1">
                    ✅ Fail PDF Sedia Diterbitkan
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900">{pdfFileName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Saiz: <strong className="text-slate-800">{pdfFileSize}</strong> · Format:{' '}
                    <strong className="text-slate-800">Dokumen PDF</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <label
                    htmlFor="quick-pdf-input"
                    className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl cursor-pointer transition-colors shadow-2xs"
                  >
                    Tukar Fail PDF Lain
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfUrl('');
                      setPdfFileName('');
                      setPdfFileSize('');
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors shadow-2xs"
                  >
                    Padam Fail
                  </button>
                </div>

                {/* PDF Live Embedded Viewer Preview */}
                <div className="mt-4 rounded-2xl border-2 border-slate-900 overflow-hidden bg-slate-900 shadow-md max-w-2xl mx-auto">
                  <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Pratonton Kandungan Fail PDF Komik
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{pdfFileName}</span>
                  </div>
                  <iframe src={pdfUrl} title="Pratonton PDF Cikgu" className="w-full h-72 sm:h-96 bg-white" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex p-4 rounded-3xl bg-indigo-100 text-indigo-700 border border-indigo-200">
                  <Upload className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    Tarik & Lepaskan Fail PDF Komik Anda Di Sini
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Pilih fail <strong>.pdf</strong> karya anda (sehingga 25MB). Murid akan dapat membaca komik ini secara langsung dalam e-reader interaktif!
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <label
                    htmlFor="quick-pdf-input"
                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl cursor-pointer transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Pilih Fail PDF dari Peranti Anda
                  </label>

                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="px-4 py-2.5 text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-200 rounded-2xl transition-colors border border-amber-400/60 shadow-2xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-amber-800" />
                    Cuba Muat Naik Sampel PDF Contoh
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Manga Images Dropzone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleProcessMangaImages(e.dataTransfer.files);
              }
            }}
            className={`border-3 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-50 scale-[0.99]'
                : uploadedPanels.length > 0
                ? 'border-emerald-300 bg-emerald-50/20'
                : 'border-slate-300 hover:border-amber-400 bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              id="quick-manga-input"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleProcessMangaImages(e.target.files);
                }
              }}
            />

            {uploadedPanels.length > 0 ? (
              <div className="space-y-4">
                <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300">
                  <Layers className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block mb-1">
                    ✅ {uploadedPanels.length} Panel Manga Berjaya Disusun
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    Semua helaian komik telah disusun mengikut giliran panel 1 hingga {uploadedPanels.length}.
                  </p>
                </div>

                {/* Grid Preview of Panels */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {uploadedPanels.map((panel, idx) => (
                    <div
                      key={panel.id}
                      className="rounded-xl overflow-hidden border-2 border-slate-900 bg-slate-900 relative aspect-4/3 shadow-xs"
                    >
                      <img
                        src={panel.imageUrl}
                        alt={`Panel ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-sm">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <label
                    htmlFor="quick-manga-input"
                    className="px-3.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-200 border border-amber-400 rounded-xl cursor-pointer transition-colors shadow-2xs"
                  >
                    Tambah / Muat Naik Semula Imej
                  </label>
                  <button
                    type="button"
                    onClick={() => setUploadedPanels([])}
                    className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors shadow-2xs"
                  >
                    Kosongkan Imej
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex p-4 rounded-3xl bg-amber-100 text-amber-800 border border-amber-300">
                  <ImageIcon className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    Pilih Satu atau Pelbagai Gambar Halaman Manga
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Format disokong: PNG, JPG, JPEG, WebP. Anda boleh memilih banyak fail sekali gus untuk babak komik anda!
                  </p>
                </div>

                <div className="pt-2">
                  <label
                    htmlFor="quick-manga-input"
                    className="px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-2xl cursor-pointer transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Pilih Gambar Manga dari Peranti
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 3: Maklumat & Kurikulum Komik */}
      <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-slate-200">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Langkah 3: Maklumat Asas & Sasaran Murid
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Tajuk Komik: <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kembara Hang Tuah & Sahabat, Misi Penjodoh Bilangan"
              required
              className="w-full px-4 py-2.5 text-sm font-bold border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Tahap Murid:</label>
            <select
              value={tahap}
              onChange={(e) => {
                const newTahap = e.target.value as TahapLevel;
                setTahap(newTahap);
                setYearLevel(newTahap === 'Tahap 1' ? 'Tahun 2' : 'Tahun 5');
              }}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white"
            >
              <option value="Tahap 1">Tahap 1 (Tahun 1, 2, 3 - Umur 7-9 Tahun)</option>
              <option value="Tahap 2">Tahap 2 (Tahun 4, 5, 6 - Umur 10-12 Tahun)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Tahun Persekolahan:</label>
            <select
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white"
            >
              {tahap === 'Tahap 1' ? (
                <>
                  <option value="Tahun 1">Tahun 1</option>
                  <option value="Tahun 2">Tahun 2</option>
                  <option value="Tahun 3">Tahun 3</option>
                </>
              ) : (
                <>
                  <option value="Tahun 4">Tahun 4</option>
                  <option value="Tahun 5">Tahun 5</option>
                  <option value="Tahun 6">Tahun 6</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Fokus Tatabahasa / Topik:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Kata Sopan, Kata Adjektif, Kata Kerja"
              className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Kod DSKP KSSR:</label>
            <input
              type="text"
              value={dskpCode}
              onChange={(e) => setDskpCode(e.target.value)}
              placeholder="Contoh: SK 5.1 / SP 5.1.4"
              className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 mb-1">Sinopsis Cerita:</label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={2}
              placeholder="Berikan ringkasan ringkas cerita komik ini untuk menarik minat murid..."
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white"
            />
          </div>
        </div>

        {/* Step 4: Pilihan Muka Depan */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
            Pilihan Muka Depan Komik (Cover):
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {uploadMode === 'pdf' && (
              <button
                type="button"
                onClick={() => {
                  setCoverChoice('pdf_auto');
                  setCoverType('pdf');
                  setCoverImage(pdfUrl);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
                  coverChoice === 'pdf_auto'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Halaman Pertama Dokumen PDF
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setCoverChoice('preset');
                setCoverType('image');
                setCoverImage('/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
                coverChoice === 'preset'
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ilustrasi Anime Bertema
            </button>
          </div>

          {coverChoice === 'preset' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                {
                  id: 'kuih',
                  url: '/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg',
                  label: 'Keluarga & Nilai Murni (Ali & Siti)',
                },
                {
                  id: 'kancil',
                  url: '/src/assets/images/comic_sang_kancil_rimba_1790644974975.jpg',
                  label: 'Sang Kancil & Rimba (Haiwan / Alam)',
                },
                {
                  id: 'robot',
                  url: '/src/assets/images/comic_angkasa_robot_1790645005429.jpg',
                  label: 'Robot & Bima Sakti (Sains / Masa Depan)',
                },
              ].map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    setCoverImage(preset.url);
                    setCoverType('image');
                  }}
                  className={`p-2 rounded-xl border-2 cursor-pointer transition-all ${
                    coverImage === preset.url
                      ? 'border-amber-500 bg-amber-100/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="aspect-4/3 rounded-lg overflow-hidden mb-1.5 bg-slate-900">
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 line-clamp-1 block">
                    {preset.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 5: Soalan Latihan Objektif (Pilihan Cikgu) */}
        <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="toggle-questions"
                checked={includeQuestions}
                onChange={(e) => setIncludeQuestions(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="toggle-questions" className="text-xs sm:text-sm font-extrabold text-slate-900 cursor-pointer">
                Sertakan Soalan Latihan Objektif untuk Murid Jawab ({questions.length} Soalan)
              </label>
            </div>
            {includeQuestions && (
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-2.5 py-1 text-[11px] font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Soalan
              </button>
            )}
          </div>

          {includeQuestions && (
            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black bg-slate-800 text-white px-2 py-0.5 rounded-md">
                      Soalan #{qIdx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Padam
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Teks Soalan:
                    </label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => {
                        const copy = [...questions];
                        copy[qIdx].question = e.target.value;
                        setQuestions(copy);
                      }}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][optIdx];
                      const isCorrect = q.correctOption === letter;
                      return (
                        <div key={optIdx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...questions];
                              copy[qIdx].correctOption = letter;
                              setQuestions(copy);
                            }}
                            className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 transition-colors ${
                              isCorrect
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                            title="Klik untuk jadikan jawapan betul"
                          >
                            {letter}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                            className={`w-full px-2.5 py-1 text-xs border rounded-lg bg-white ${
                              isCorrect ? 'border-emerald-500 font-bold' : 'border-slate-300'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    * Klik butang huruf (A, B, C, D) di atas untuk menetapkan jawapan yang tepat.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isPublishing || (uploadMode === 'pdf' && !pdfUrl) || (uploadMode === 'manga_images' && uploadedPanels.length === 0)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                Sedang Menerbitkan ke Portal Murid...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-900" />
                🚀 Muat Naik & Terbitkan Terus ke Portal Murid
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
