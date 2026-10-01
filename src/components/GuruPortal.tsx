import React, { useState } from 'react';
import { ComicStory, ComicPanel, Question, StudentSubmission, TahapLevel } from '../types/comic';
import { saveComic, deleteComic, getStoredSubmissions } from '../utils/storage';
import { generateSampleComicPdf, formatFileSize } from '../utils/pdfHelper';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  FileText,
  Users,
  Image as ImageIcon,
  BookOpen,
  ArrowRight,
  Download,
  AlertCircle,
  RefreshCw,
  Upload,
  FileUp,
  FileCheck,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';
import { ResultCardModal } from './ResultCardModal';
import { ComicCoverDisplay } from './ComicCoverDisplay';
import { QuickComicUploader } from './QuickComicUploader';
import { PublicationSuccessModal } from './PublicationSuccessModal';

interface GuruPortalProps {
  comics: ComicStory[];
  onRefreshComics: () => void;
  onPreviewComic: (comic: ComicStory) => void;
  onNavigateToMuridPortal?: (comic?: ComicStory) => void;
}

export const GuruPortal: React.FC<GuruPortalProps> = ({
  comics,
  onRefreshComics,
  onPreviewComic,
  onNavigateToMuridPortal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'koleksi' | 'muat_naik_cepat' | 'bina_manual' | 'bina_ai' | 'submissions'
  >('koleksi');
  const [publishedSuccessComic, setPublishedSuccessComic] = useState<ComicStory | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Comic Form State
  const [editingComicId, setEditingComicId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [tahap, setTahap] = useState<TahapLevel>('Tahap 1');
  const [yearLevel, setYearLevel] = useState('Tahun 2');
  const [topic, setTopic] = useState('Kata Sopan & Kata Perintah');
  const [dskpCode, setDskpCode] = useState('SK 5.1 / SP 5.1.4');
  const [coverImage, setCoverImage] = useState('/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg');
  const [coverType, setCoverType] = useState<'image' | 'pdf'>('image');
  const [coverPdfFileName, setCoverPdfFileName] = useState<string>('');
  const [coverFileSize, setCoverFileSize] = useState<string>('');
  const [coverUploadMode, setCoverUploadMode] = useState<'preset' | 'upload_image' | 'upload_pdf'>('preset');
  const [isCoverDragging, setIsCoverDragging] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState(true);

  // Cover Upload Handlers (Image or PDF)
  const handleCoverImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail format imej (PNG, JPG, JPEG, WebP) sahaja.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('Saiz fail imej melebihi 8MB. Sila pilih gambar yang lebih mampat.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCoverImage(dataUrl);
      setCoverType('image');
      setCoverPdfFileName(file.name);
      setCoverFileSize(formatFileSize(file.size));
      setCoverUploadMode('upload_image');
    };
    reader.readAsDataURL(file);
  };

  const handleCoverPdfUpload = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Sila pilih fail berformat PDF (.pdf) sahaja.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('Saiz fail PDF melebihi 15MB. Sila pilih fail yang lebih mampat.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCoverImage(dataUrl);
      setCoverType('pdf');
      setCoverPdfFileName(file.name);
      setCoverFileSize(formatFileSize(file.size));
      setCoverUploadMode('upload_pdf');
    };
    reader.readAsDataURL(file);
  };

  const handleUseComicPdfAsCover = () => {
    if (!pdfUrl) {
      alert('Sila muat naik fail komik PDF di Bahagian 2 terlebih dahulu.');
      return;
    }
    setCoverImage(pdfUrl);
    setCoverType('pdf');
    setCoverPdfFileName(pdfFileName || 'Muka_Depan_Komik.pdf');
    setCoverFileSize(pdfFileSize || '');
    setCoverUploadMode('upload_pdf');
  };

  // Comic Format: Panels vs PDF
  const [comicFormat, setComicFormat] = useState<'panels' | 'pdf'>('panels');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfFileSize, setPdfFileSize] = useState<string>('');
  const [pdfUploadDate, setPdfUploadDate] = useState<string>('');
  const [pdfFileType, setPdfFileType] = useState<string>('');
  const [isPdfDragging, setIsPdfDragging] = useState<boolean>(false);

  // File Upload Process
  const handlePdfUpload = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Sila pilih fail dokumen berformat PDF (.pdf) sahaja.');
      return;
    }

    // Limit to reasonable size for browser storage (approx 15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('Saiz fail PDF melebihi 15MB. Sila pilih fail yang lebih mampat.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPdfUrl(dataUrl);
      setPdfFileName(file.name);
      setPdfFileSize(formatFileSize(file.size));
      setPdfUploadDate(new Date().toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }));
      setPdfFileType(file.type || 'application/pdf');
      setComicFormat('pdf');
      if (!title) {
        setTitle(file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseSamplePdf = () => {
    const sampleDataUrl = generateSampleComicPdf();
    setPdfUrl(sampleDataUrl);
    setPdfFileName('Komik_Adab_Bahasa_Melayu_Contoh.pdf');
    setPdfFileSize('12.5 KB');
    setPdfUploadDate(new Date().toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }));
    setPdfFileType('application/pdf');
    setComicFormat('pdf');
    if (!title) {
      setTitle('Komik Adab & Kesantunan Bahasa Melayu (E-Komik)');
    }
  };

  const handleRemovePdf = () => {
    setPdfUrl('');
    setPdfFileName('');
    setPdfFileSize('');
    setPdfUploadDate('');
    setPdfFileType('');
    setComicFormat('panels');
  };

  const handleStartNewComic = () => {
    setEditingComicId(null);
    setTitle('');
    setSynopsis('');
    setTahap('Tahap 1');
    setYearLevel('Tahun 2');
    setTopic('Kata Sopan & Kata Perintah');
    setDskpCode('SK 5.1 / SP 5.1.4');
    setCoverImage('/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg');
    setCoverType('image');
    setCoverPdfFileName('');
    setCoverFileSize('');
    setCoverUploadMode('preset');
    setIsPublished(true);
    setComicFormat('panels');
    setPdfUrl('');
    setPdfFileName('');
    setPdfFileSize('');
    setPdfUploadDate('');
    setPdfFileType('');
    setPanels([
      {
        id: `p-new-${Date.now()}`,
        panelNumber: 1,
        imageUrl: '/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg',
        characterName: 'Ali',
        dialogue: 'Siti, sila makan kuih ini.',
        soundEffect: 'Chup! Senyum Mesra',
        narration: 'Ali mempelawa adik sepupunya menjamah hidangan petang dengan sopan.',
      },
    ]);
    setQuestions([
      {
        id: `q-new-${Date.now()}`,
        panelRef: 1,
        question: 'Apakah kata sopan yang digunakan oleh Ali?',
        options: ['A) sila', 'B) makan', 'C) kuih', 'D) ini'],
        correctOption: 'A',
        explanationTahap1: 'Zzzap! Tepat sekali! "Sila" ialah kata sopan untuk menjemput orang lain.',
        explanationTahap2: 'Kata "sila" merupakan kata perintah silaan yang memelihara adab kesantunan berbahasa.',
      },
    ]);
    setActiveSubTab('bina_manual');
  };

  // Panels State
  const [panels, setPanels] = useState<ComicPanel[]>([
    {
      id: 'p-new-1',
      panelNumber: 1,
      imageUrl: '/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg',
      characterName: 'Ali',
      dialogue: 'Siti, sila makan kuih ini.',
      soundEffect: 'Chup! Senyum Mesra',
      narration: 'Ali mempelawa adik sepupunya menjamah hidangan petang dengan sopan.',
    },
  ]);

  // Questions State
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q-new-1',
      panelRef: 1,
      question: 'Apakah kata sopan yang digunakan oleh Ali?',
      options: ['A) sila', 'B) makan', 'C) kuih', 'D) ini'],
      correctOption: 'A',
      explanationTahap1: 'Zzzap! Tepat sekali! "Sila" ialah kata sopan untuk menjemput orang lain.',
      explanationTahap2: 'Kata "sila" merupakan kata perintah silaan yang memelihara adab kesantunan berbahasa.',
    },
  ]);

  // AI Generator Form
  const [aiTopic, setAiTopic] = useState('Penjodoh Bilangan & Kata Bilangan');
  const [aiTahap, setAiTahap] = useState<TahapLevel>('Tahap 1');
  const [aiCharacters, setAiCharacters] = useState('Hakim dan Cikgu Sarah');
  const [aiSetting, setAiSetting] = useState('Perpustakaan Mini Sekolah');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState('');

  // Selected Submission Modal
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const submissions = getStoredSubmissions();

  // Load Prompt Worked Example
  const handleLoadWorkedExample = () => {
    setTitle('Adab Menjamu Selera: Ali dan Siti');
    setSynopsis('Ali mempelawa Siti menikmati kuih dengan amalan kata sopan dalam pertuturan harian.');
    setTahap('Tahap 1');
    setYearLevel('Tahun 2');
    setTopic('Kata Sopan');
    setDskpCode('SK 5.1 / SP 5.1.4');
    setCoverImage('/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg');
    setIsPublished(true);
    setPanels([
      {
        id: 'p-ex-1',
        panelNumber: 1,
        imageUrl: '/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg',
        characterName: 'Ali',
        dialogue: 'Siti, sila makan kuih ini.',
        soundEffect: 'Senyum Ikhlas~',
        narration: 'Ali mempelawa adiknya makan kuih tradisional dengan santun.',
      },
    ]);
    setQuestions([
      {
        id: 'q-ex-1',
        panelRef: 1,
        question: 'Apakah kata sopan yang digunakan oleh Ali?',
        options: ['A) sila', 'B) makan', 'C) kuih', 'D) ini'],
        correctOption: 'A',
        explanationTahap1: 'Zzzap! "Sila" ialah kata sopan pelawaan yang penuh adab!',
        explanationTahap2: 'Kata "sila" dikategorikan sebagai kata perintah jenis silaan dalam morfologi Bahasa Melayu.',
      },
    ]);
    setActiveSubTab('bina_manual');
  };

  // Panel Handlers
  const handleAddPanel = () => {
    const nextNum = panels.length + 1;
    setPanels([
      ...panels,
      {
        id: `p-${Date.now()}`,
        panelNumber: nextNum,
        imageUrl: coverImage,
        characterName: 'Watak ' + nextNum,
        dialogue: 'Tulis dialog watak di sini...',
        soundEffect: 'Zzzap!',
        narration: 'Penerangan babak...',
      },
    ]);
  };

  const handleUpdatePanel = (index: number, field: keyof ComicPanel, val: any) => {
    const copy = [...panels];
    copy[index] = { ...copy[index], [field]: val };
    setPanels(copy);
  };

  const handlePanelImageUpload = (panelIndex: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail imej (PNG, JPG, WebP) sahaja.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      handleUpdatePanel(panelIndex, 'imageUrl', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleBatchPanelUpload = (files: FileList) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Tiada fail imej yang sah dipilih.');
      return;
    }

    let loadedCount = 0;
    const newPanelsList: ComicPanel[] = [];

    validFiles.forEach((file, fIdx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        newPanelsList[fIdx] = {
          id: `p-batch-${Date.now()}-${fIdx}`,
          panelNumber: fIdx + 1,
          imageUrl: dataUrl,
          characterName: `Watak Panel ${fIdx + 1}`,
          dialogue: `Dialog watak bagi Panel ${fIdx + 1}...`,
          soundEffect: 'Zzzap!',
          narration: `Babak ${fIdx + 1}`,
        };
        loadedCount++;
        if (loadedCount === validFiles.length) {
          setPanels(newPanelsList);
          alert(`✅ Berjaya memuat naik ${validFiles.length} panel komik sekaligus!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeletePanel = (index: number) => {
    if (panels.length <= 1) return;
    const copy = panels.filter((_, i) => i !== index).map((p, idx) => ({ ...p, panelNumber: idx + 1 }));
    setPanels(copy);
  };

  // State for immediate preview of published comic
  const [justPublishedComic, setJustPublishedComic] = useState<ComicStory | null>(null);

  // Question Handlers
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        panelRef: 1,
        question: 'Tulis soalan objektif berkaitan komik...',
        options: ['A) Pilihan A', 'B) Pilihan B', 'C) Pilihan C', 'D) Pilihan D'],
        correctOption: 'A',
        explanationTahap1: 'Gempak! Jawapan tepat!',
        explanationTahap2: 'Huraian tatabahasa mengikut DSKP...',
      },
    ]);
  };

  const handleUpdateQuestion = (index: number, field: keyof Question, val: any) => {
    const copy = [...questions];
    copy[index] = { ...copy[index], [field]: val };
    setQuestions(copy);
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, text: string) => {
    const copy = [...questions];
    const opts = [...copy[qIndex].options];
    opts[optIndex] = text;
    copy[qIndex].options = opts;
    setQuestions(copy);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Save Comic from Manual Builder
  const handleSaveComic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Sila masukkan tajuk komik.');
      return;
    }

    const newComic: ComicStory = {
      id: editingComicId || `comic-${Date.now()}`,
      title: title.trim(),
      synopsis: synopsis.trim() || 'Komik pengembaraan pembelajaran Bahasa Melayu.',
      coverImage: coverImage || '/src/assets/images/comic_sang_kancil_rimba_1790644974975.jpg',
      coverType,
      coverPdfFileName: coverType === 'pdf' ? (coverPdfFileName || undefined) : undefined,
      tahap,
      yearLevel,
      topic: topic.trim() || 'Tatabahasa',
      dskpCode: dskpCode.trim() || 'DSKP KSSR',
      comicFormat,
      pdfUrl: comicFormat === 'pdf' ? (pdfUrl || undefined) : undefined,
      pdfFileName: comicFormat === 'pdf' ? (pdfFileName || undefined) : undefined,
      pdfFileSize: comicFormat === 'pdf' ? (pdfFileSize || undefined) : undefined,
      pdfUploadDate: comicFormat === 'pdf' ? (pdfUploadDate || undefined) : undefined,
      pdfFileType: comicFormat === 'pdf' ? (pdfFileType || 'application/pdf') : undefined,
      panels,
      questions,
      isPublished: true, // Always ensure published for Murid Portal visibility
      createdAt: new Date().toISOString().split('T')[0],
      author: 'Cikgu (Guru Portal)',
    };

    try {
      await saveComic(newComic);
      onRefreshComics();
      setPublishedSuccessComic(newComic);
      setEditingComicId(null);
      setActiveSubTab('koleksi');
    } catch (err: any) {
      console.error('Error saving comic:', err);
      alert('Ralat semasa menyimpan komik: ' + err.message);
    }
  };

  // Quick Upload Handler
  const handleQuickUploadAndPublish = async (comic: ComicStory) => {
    await saveComic(comic);
    onRefreshComics();
    setPublishedSuccessComic(comic);
    setActiveSubTab('koleksi');
  };

  // Edit Existing Comic
  const handleEditComic = (c: ComicStory) => {
    setEditingComicId(c.id);
    setTitle(c.title);
    setSynopsis(c.synopsis);
    setTahap(c.tahap);
    setYearLevel(c.yearLevel);
    setTopic(c.topic);
    setDskpCode(c.dskpCode);
    setCoverImage(c.coverImage || '/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg');
    const isPdfCover = c.coverType === 'pdf' || c.coverImage?.startsWith('data:application/pdf');
    setCoverType(isPdfCover ? 'pdf' : 'image');
    setCoverPdfFileName(c.coverPdfFileName || '');
    setCoverUploadMode(
      isPdfCover
        ? 'upload_pdf'
        : c.coverImage?.startsWith('data:image')
        ? 'upload_image'
        : 'preset'
    );
    setIsPublished(c.isPublished);
    setComicFormat(c.comicFormat || (c.pdfUrl ? 'pdf' : 'panels'));
    setPdfUrl(c.pdfUrl || '');
    setPdfFileName(c.pdfFileName || '');
    setPdfFileSize(c.pdfFileSize || '');
    setPdfUploadDate(c.pdfUploadDate || '');
    setPdfFileType(c.pdfFileType || '');
    setPanels(c.panels || []);
    setQuestions(c.questions || []);
    setActiveSubTab('bina_manual');
  };

  // AI Generator Submit
  const handleGenerateAiComic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAiGenerating(true);
    setAiStatusMsg('Sensei BM sedang mengarang jalan cerita komik mengikut sukatan DSKP...');

    try {
      const res = await fetch('/api/ai/generate-comic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          tahap: aiTahap,
          characterNames: aiCharacters,
          setting: aiSetting,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const generated = data.data;
        setTitle(generated.title);
        setSynopsis(generated.synopsis);
        setTahap(aiTahap);
        setYearLevel(aiTahap === 'Tahap 1' ? 'Tahun 3' : 'Tahun 5');
        setTopic(generated.theme || aiTopic);
        setDskpCode('DSKP KSSR Semakan');

        // Choose a matching image based on topic
        const chosenImage =
          aiTopic.toLowerCase().includes('angkasa') || aiTopic.toLowerCase().includes('sains')
            ? '/src/assets/images/comic_angkasa_robot_1790645005429.jpg'
            : aiTopic.toLowerCase().includes('rimba') || aiTopic.toLowerCase().includes('haiwan')
            ? '/src/assets/images/comic_sang_kancil_rimba_1790644974975.jpg'
            : '/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg';

        setCoverImage(chosenImage);

        // Map panels
        const mappedPanels: ComicPanel[] = (generated.panels || []).map((p: any, idx: number) => ({
          id: `p-ai-${idx + 1}`,
          panelNumber: p.panelNumber || idx + 1,
          imageUrl: chosenImage,
          characterName: p.dialogue?.split(':')[0]?.replace(/["*]/g, '').trim() || 'Watak BM',
          dialogue: p.dialogue?.includes(':') ? p.dialogue.split(':')[1]?.replace(/["*]/g, '').trim() : p.dialogue,
          soundEffect: p.soundEffect || 'Zzzap! Semangat!',
          narration: p.description || '',
        }));
        setPanels(mappedPanels.length > 0 ? mappedPanels : panels);

        // Map questions
        const mappedQuestions: Question[] = (generated.questions || []).map((q: any, idx: number) => ({
          id: `q-ai-${idx + 1}`,
          panelRef: q.panelRef || 1,
          question: q.question,
          options: q.options || ['A) Opsyen 1', 'B) Opsyen 2', 'C) Opsyen 3', 'D) Opsyen 4'],
          correctOption: q.correctOption || 'A',
          explanationTahap1: q.explanationTahap1 || 'Hebat! Jawapan kamu tepat.',
          explanationTahap2: q.explanationTahap2 || 'Huraian mengikut hukum tatabahasa Bahasa Melayu.',
        }));
        setQuestions(mappedQuestions.length > 0 ? mappedQuestions : questions);

        alert('✨ Bahan Komik & Soalan berjaya dijana oleh Sensei BM! Sila semak draf sebelum diterbitkan.');
        setActiveSubTab('bina_manual');
      } else {
        alert(data.error || 'Gagal menjana bahan komik.');
      }
    } catch (err: any) {
      alert('Ralat semasa menghubungi pelayan: ' + err.message);
    } finally {
      setIsAiGenerating(false);
      setAiStatusMsg('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-indigo-400/40 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold mb-2 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Panel Pengurusan Guru BM
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Papan Pemuka Guru & Pembina Komik
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl">
            Cipta, ubah suai, dan terbitkan bahan bacaan komik manga berserta set soalan pentaksiran objektif mengikut DSKP.
          </p>
        </div>

        {/* Quick Actions Header */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/download-project"
            download="sensei-bm-projek-lengkap.zip"
            className="px-3.5 py-2 text-xs font-black text-amber-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-yellow-200 rounded-xl transition-all shadow-md flex items-center gap-1.5 border border-amber-400"
            title="Muat turun keseluruhan aplikasi ini sebagai fail ZIP untuk disimpan dan dibuka di komputer"
          >
            <Download className="w-4 h-4 text-amber-950" />
            Muat Turun Fail Web (ZIP)
          </a>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="px-3.5 py-2 text-xs font-black text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-xl transition-all shadow-md flex items-center gap-1.5 border border-emerald-400"
          >
            <Share2 className="w-4 h-4 text-emerald-950" />
            Kongsi Pautan Murid
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('muat_naik_cepat')}
            className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-yellow-300 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-slate-900" />
            Muat Naik Komik (PDF / Gambar)
          </button>

          {onNavigateToMuridPortal && (
            <button
              type="button"
              onClick={() => onNavigateToMuridPortal()}
              className="px-3.5 py-2 text-xs font-bold text-indigo-100 bg-indigo-700/80 hover:bg-indigo-600 rounded-xl transition-colors border border-indigo-400/40 shadow-xs flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-amber-300" />
              Lihat Portal Murid
            </button>
          )}

          <button
            type="button"
            onClick={handleLoadWorkedExample}
            className="px-3 py-2 text-xs font-bold text-indigo-200 bg-indigo-900/60 hover:bg-indigo-800 rounded-xl transition-colors border border-indigo-500/30 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Contoh Soalan
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-amber-200/80 pb-3 mb-6 overflow-x-auto text-xs sm:text-sm">
        <button
          onClick={() => setActiveSubTab('koleksi')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeSubTab === 'koleksi'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Senarai Komik Guru ({comics.length})
        </button>

        <button
          onClick={() => setActiveSubTab('muat_naik_cepat')}
          className={`px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 shrink-0 ${
            activeSubTab === 'muat_naik_cepat'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md ring-2 ring-amber-400'
              : 'text-amber-900 bg-amber-100 hover:bg-amber-200'
          }`}
        >
          <Upload className="w-4 h-4 text-amber-800" />
          ⚡ Muat Naik Komik Cepat (PDF / Gambar)
        </button>

        <button
          onClick={handleStartNewComic}
          className={`px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeSubTab === 'bina_manual' && !editingComicId
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/50'
          }`}
        >
          <Plus className="w-4 h-4" />
          Bina Panel & Soalan Manual
        </button>

        <button
          onClick={() => setActiveSubTab('bina_ai')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeSubTab === 'bina_ai'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Bina Automatik AI Sensei BM
        </button>

        <button
          onClick={() => setActiveSubTab('submissions')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeSubTab === 'submissions'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/50'
          }`}
        >
          <Users className="w-4 h-4" />
          Rekod Markah Murid ({submissions.length})
        </button>
      </div>

      {/* Tab: Muat Naik Komik Cepat (PDF / Gambar) */}
      {activeSubTab === 'muat_naik_cepat' && (
        <QuickComicUploader
          onSaveAndPublish={handleQuickUploadAndPublish}
          onCancel={() => setActiveSubTab('koleksi')}
        />
      )}

      {/* Tab 1: Koleksi Komik */}
      {activeSubTab === 'koleksi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comics.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl overflow-hidden border-2 border-amber-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                    <ComicCoverDisplay
                      coverUrl={c.coverImage}
                      coverType={c.coverType}
                      title={c.title}
                    />
                    <div className="absolute top-2 left-2 flex gap-1 z-20">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                        {c.tahap} ({c.yearLevel})
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white ${
                          c.isPublished ? 'bg-emerald-600' : 'bg-slate-600'
                        }`}
                      >
                        {c.isPublished ? 'Diterbitkan' : 'Draf'}
                      </span>
                      {c.coverType === 'pdf' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                          Cover PDF
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">
                      {c.topic}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{c.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.synopsis}</p>

                    <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                      <span>{c.comicFormat === 'pdf' ? 'Dokumen PDF' : `${c.panels.length} Panel Komik`}</span>
                      <span>{c.questions.length} Soalan Objektif</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => onPreviewComic(c)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Pratonton
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditComic(c)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Ubah Suai"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Padamkan komik "${c.title}"?`)) {
                          deleteComic(c.id);
                          onRefreshComics();
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Padam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Bina Komik Manual / Edit */}
      {activeSubTab === 'bina_manual' && (
        <form onSubmit={handleSaveComic} className="space-y-8">
          {/* Section 1: Maklumat Asas Komik */}
          <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                {editingComicId ? 'Ubah Suai Komik' : '1. Maklumat Asas Komik'}
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  Terbitkan terus ke Portal Murid
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tajuk Komik</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jamuan Petang yang Sopan: Ali & Siti"
                  required
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topik / Fokus Tatabahasa (DSKP)
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Kata Sopan, Kata Hubung, Imbuhan Awalan"
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tahap & Tahun</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={tahap}
                    onChange={(e) => setTahap(e.target.value as TahapLevel)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Tahap 1">Tahap 1 (Tahun 1-3)</option>
                    <option value="Tahap 2">Tahap 2 (Tahun 4-6)</option>
                  </select>
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Tahun 1">Tahun 1</option>
                    <option value="Tahun 2">Tahun 2</option>
                    <option value="Tahun 3">Tahun 3</option>
                    <option value="Tahun 4">Tahun 4</option>
                    <option value="Tahun 5">Tahun 5</option>
                    <option value="Tahun 6">Tahun 6</option>
                  </select>
                </div>
              </div>

              {/* Muka Depan Komik (Cover Page) - Image / PDF / Preset */}
              <div className="md:col-span-2 bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
                  <div>
                    <label className="block text-xs font-black text-slate-900">
                      Muka Depan Komik (Cover Page)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Muat naik muka depan sendiri dalam format <strong>Imej (JPG/PNG)</strong> atau <strong>PDF</strong>, atau gunakan tema sedia ada.
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200 shrink-0 text-xs">
                    <button
                      type="button"
                      onClick={() => setCoverUploadMode('upload_image')}
                      className={`px-2.5 py-1 font-bold rounded-lg transition-colors flex items-center gap-1 ${
                        coverUploadMode === 'upload_image'
                          ? 'bg-amber-400 text-amber-950 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Muat Naik Imej
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverUploadMode('upload_pdf')}
                      className={`px-2.5 py-1 font-bold rounded-lg transition-colors flex items-center gap-1 ${
                        coverUploadMode === 'upload_pdf'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      Muat Naik PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCoverUploadMode('preset');
                        setCoverType('image');
                        if (!coverImage || coverImage.startsWith('data:')) {
                          setCoverImage('/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg');
                        }
                      }}
                      className={`px-2.5 py-1 font-bold rounded-lg transition-colors ${
                        coverUploadMode === 'preset'
                          ? 'bg-amber-400 text-amber-950 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Galeri Preset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Left Column: Upload Controls according to mode */}
                  <div className="md:col-span-8 space-y-3">
                    {coverUploadMode === 'upload_image' && (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsCoverDragging(true);
                        }}
                        onDragLeave={() => setIsCoverDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsCoverDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleCoverImageUpload(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                          isCoverDragging
                            ? 'border-amber-500 bg-amber-100/50'
                            : 'border-amber-300 bg-white hover:border-amber-400'
                        }`}
                      >
                        <input
                          type="file"
                          id="cover-image-input"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleCoverImageUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <div className="space-y-1.5">
                          <div className="inline-flex p-2 rounded-xl bg-amber-100 text-amber-800">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            Pilih atau Tarik Imej Muka Depan (PNG / JPG / WebP)
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Maksimum 8MB · Nisbah disyorkan 4:3 atau menegak
                          </p>
                          <div className="pt-1">
                            <label
                              htmlFor="cover-image-input"
                              className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1.5"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              Pilih Fail Imej
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {coverUploadMode === 'upload_pdf' && (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsCoverDragging(true);
                        }}
                        onDragLeave={() => setIsCoverDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsCoverDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleCoverPdfUpload(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                          isCoverDragging
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-indigo-300 bg-white hover:border-indigo-400'
                        }`}
                      >
                        <input
                          type="file"
                          id="cover-pdf-input"
                          accept="application/pdf,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleCoverPdfUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <div className="space-y-1.5">
                          <div className="inline-flex p-2 rounded-xl bg-indigo-100 text-indigo-700">
                            <FileUp className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            Pilih atau Tarik Fail Dokumen PDF Muka Depan
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Format PDF (.pdf) · Halaman pertama akan dijadikan muka depan
                          </p>
                          <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                            <label
                              htmlFor="cover-pdf-input"
                              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Pilih Fail PDF
                            </label>

                            {pdfUrl && (
                              <button
                                type="button"
                                onClick={handleUseComicPdfAsCover}
                                className="px-3 py-1.5 text-xs font-bold text-indigo-900 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 rounded-lg transition-colors inline-flex items-center gap-1"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                Guna PDF Komik dari Bahagian 2
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {coverUploadMode === 'preset' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Pilih Tema Gambar daripada Galeri:
                        </label>
                        <select
                          value={coverImage}
                          onChange={(e) => {
                            setCoverImage(e.target.value);
                            setCoverType('image');
                            setCoverPdfFileName('');
                          }}
                          className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white"
                        >
                          <option value="/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg">
                            Pasar Malam & Gerai Kuih (Mesra / Keluarga)
                          </option>
                          <option value="/src/assets/images/comic_sang_kancil_rimba_1790644974975.jpg">
                            Sang Kancil & Rimba (Haiwan / Alam Sekitar)
                          </option>
                          <option value="/src/assets/images/comic_angkasa_robot_1790645005429.jpg">
                            Galaksi Bima Sakti & Robot (Sains / Masa Depan)
                          </option>
                        </select>
                      </div>
                    )}

                    {/* Metadata status bar */}
                    {coverImage && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Muka Depan Aktif: {coverType === 'pdf' ? 'Dokumen PDF' : 'Imej'}
                        </span>
                        {coverPdfFileName && (
                          <span className="font-medium text-slate-700">
                            {coverPdfFileName}
                          </span>
                        )}
                        {coverFileSize && (
                          <span className="text-slate-400">
                            ({coverFileSize})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Live Cover Card Preview */}
                  <div className="md:col-span-4 flex flex-col items-center">
                    <span className="text-[11px] font-bold text-slate-500 mb-1.5 self-start">
                      Pratonton Muka Depan:
                    </span>
                    <div className="w-full max-w-[180px] aspect-4/3 rounded-xl overflow-hidden border-2 border-slate-900 shadow-md bg-slate-900 relative">
                      <ComicCoverDisplay
                        coverUrl={coverImage}
                        coverType={coverType}
                        title={title || 'Muka Depan Komik'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Sinopsis Ringkas</label>
                <textarea
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  rows={2}
                  placeholder="Ceritakan serba sedikit sinopsis cerita komik ini untuk murid..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pengurusan Panel Manga & Dialog / Muat Naik PDF */}
          <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-100 pb-4 gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-600" />
                  2. Panel Manga, Dialog & Fail Komik PDF
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih sama ada menyusun panel manga bergambar atau memuat naik fail buku komik anda sendiri dalam format PDF.
                </p>
              </div>

              {/* Format Toggle Buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-amber-50 rounded-xl border border-amber-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setComicFormat('panels')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    comicFormat === 'panels'
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Panel Bergambar
                </button>
                <button
                  type="button"
                  onClick={() => setComicFormat('pdf')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    comicFormat === 'pdf'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-700 hover:text-indigo-900'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" />
                  Muat Naik Komik PDF
                  {pdfUrl && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                </button>
              </div>
            </div>

            {/* Pilihan A: Muat Naik Fail Komik PDF Sendiri */}
            {comicFormat === 'pdf' ? (
              <div className="space-y-4">
                {/* Upload Box / Drag & Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsPdfDragging(true);
                  }}
                  onDragLeave={() => setIsPdfDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsPdfDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handlePdfUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isPdfDragging
                      ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
                      : pdfUrl
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    id="guru-pdf-input"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handlePdfUpload(e.target.files[0]);
                      }
                    }}
                  />

                  {pdfUrl ? (
                    <div className="space-y-3">
                      <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300">
                        <FileCheck className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                          ✅ Fail PDF Berjaya Dimuat Naik & Disimpan
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900">{pdfFileName}</h4>
                        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 mt-1">
                          <span>Saiz: <strong className="text-slate-800">{pdfFileSize}</strong></span>
                          <span>·</span>
                          <span>Jenis: <strong className="text-slate-800">{pdfFileType || 'PDF Document'}</strong></span>
                          {pdfUploadDate && (
                            <>
                              <span>·</span>
                              <span>Dimuat naik: <strong className="text-slate-800">{pdfUploadDate}</strong></span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <label
                          htmlFor="guru-pdf-input"
                          className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                        >
                          Tukar Fail PDF Lain
                        </label>
                        <button
                          type="button"
                          onClick={(e) => handleSaveComic(e)}
                          className="px-3.5 py-1.5 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                          Terbitkan Komik PDF Ini Sekarang
                        </button>
                        <a
                          href={pdfUrl}
                          download={pdfFileName || 'Komik_Guru.pdf'}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Muat Turun Fail
                        </a>
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Buka di Tab Baru
                        </a>
                        <button
                          type="button"
                          onClick={handleRemovePdf}
                          className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors shadow-2xs"
                        >
                          Padam PDF
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="inline-flex p-3 rounded-2xl bg-indigo-100 text-indigo-600 border border-indigo-200">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Tarik & Lepaskan Fail Komik PDF Di Sini
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                          Muat naik karya komik anda, lembaran bahan bacaan bergambar, atau modul e-komik dalam format <strong>.PDF</strong> (Maksimum 15MB).
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <label
                          htmlFor="guru-pdf-input"
                          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          <FileUp className="w-4 h-4" />
                          Pilih Fail PDF dari Komputer
                        </label>

                        <button
                          type="button"
                          onClick={handleUseSamplePdf}
                          className="px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-xl transition-colors border border-amber-300 shadow-2xs flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                          Gunakan Sampel Fail PDF Komik
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live PDF Viewer inside teacher form */}
                {pdfUrl && (
                  <div className="rounded-2xl border-2 border-slate-800 overflow-hidden bg-slate-900 shadow-md">
                    <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Pratonton Langsung Fail Komik PDF
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {pdfFileName}
                      </span>
                    </div>
                    <iframe
                      src={pdfUrl}
                      title="Pratonton Komik PDF Guru"
                      className="w-full h-80 sm:h-96 bg-white"
                    />
                  </div>
                )}

                {/* Pedagogical Guidance Note for PDF Comics */}
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-extrabold block text-indigo-900">
                      Petua Pentaksiran Guru untuk Komik PDF:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Apabila murid membaca komik PDF ini di Portal Murid, paparan PDF akan dibuka di sebelah kiri, manakala soalan latihan objektif terletak di sebelah kanan. Sila pastikan soalan di <strong>Bahagian 3</strong> merujuk kepada nombor halaman atau panel komik dalam fail PDF ini (contoh: <em>"Berdasarkan dialog pada Halaman 1..."</em>).
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Pilihan B: Mod Panel Manga & Belon Dialog (Standard) */
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-3">
                  <span className="text-xs font-bold text-slate-700">
                    Senarai Panel Bergambar ({panels.length} panel):
                  </span>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="batch-panels-input"
                      className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Muat Naik Banyak Panel Sekaligus (Batch)
                    </label>
                    <input
                      type="file"
                      id="batch-panels-input"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleBatchPanelUpload(e.target.files);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddPanel}
                      className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Panel
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {panels.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 relative grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
                    >
                      <div className="md:col-span-3">
                        <span className="text-xs font-extrabold bg-slate-900 text-amber-300 px-2 py-0.5 rounded-md inline-block mb-2">
                          Panel #{idx + 1}
                        </span>
                        <div className="aspect-4/3 rounded-lg overflow-hidden border-2 border-slate-300 bg-slate-100 relative group">
                          <img
                            src={p.imageUrl || coverImage}
                            alt={`Panel ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Per-panel image file upload */}
                        <div className="mt-2">
                          <input
                            type="file"
                            id={`panel-img-input-${idx}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePanelImageUpload(idx, e.target.files[0]);
                              }
                            }}
                          />
                          <label
                            htmlFor={`panel-img-input-${idx}`}
                            className="w-full px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1"
                          >
                            <ImageIcon className="w-3 h-3" />
                            {p.imageUrl ? 'Tukar Gambar Panel' : 'Muat Naik Gambar'}
                          </label>
                        </div>
                      </div>

                      <div className="md:col-span-9 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Nama Watak Bercakap
                            </label>
                            <input
                              type="text"
                              value={p.characterName}
                              onChange={(e) => handleUpdatePanel(idx, 'characterName', e.target.value)}
                              placeholder="Contoh: Ali, Siti, Cikgu"
                              className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Kesan Bunyi Komik (Sound Effect)
                            </label>
                            <input
                              type="text"
                              value={p.soundEffect || ''}
                              onChange={(e) => handleUpdatePanel(idx, 'soundEffect', e.target.value)}
                              placeholder="Contoh: Zzzap!, Woshh!, Chup!"
                              className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white text-amber-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Teks Belon Dialog Watak (Petunjuk Utama Soalan)
                          </label>
                          <input
                            type="text"
                            value={p.dialogue}
                            onChange={(e) => handleUpdatePanel(idx, 'dialogue', e.target.value)}
                            placeholder="Contoh: Siti, sila makan kuih ini."
                            className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Penerangan / Narasi Babak
                          </label>
                          <input
                            type="text"
                            value={p.narration || ''}
                            onChange={(e) => handleUpdatePanel(idx, 'narration', e.target.value)}
                            placeholder="Contoh: Ali menghulurkan piring kuih lapis dengan senyuman ceria..."
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-600"
                          />
                        </div>

                        {panels.length > 1 && (
                          <div className="text-right">
                            <button
                              type="button"
                              onClick={() => handleDeletePanel(idx)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Padam Panel Ini
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Pembina Soalan Objektif (MCQ) */}
          <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-600" />
                  3. Set Soalan Objektif (MCQ) ({questions.length} Soalan)
                </h3>
                <p className="text-xs text-slate-500">
                  Pastikan soalan merujuk secara terus kepada dialog atau babak panel komik di atas.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                Tambah Soalan
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold bg-amber-200 text-amber-950 px-2.5 py-1 rounded-md">
                      Soalan #{qIdx + 1}
                    </span>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          {comicFormat === 'pdf' ? 'Rujukan Halaman:' : 'Rujukan Panel:'}
                        </label>
                        <select
                          value={q.panelRef}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'panelRef', parseInt(e.target.value))}
                          className="px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white"
                        >
                          {comicFormat === 'pdf' ? (
                            <>
                              <option value={1}>Halaman 1 / Muka Surat 1</option>
                              <option value={2}>Halaman 2 / Muka Surat 2</option>
                              <option value={3}>Halaman 3 / Muka Surat 3</option>
                              <option value={4}>Halaman 4 / Muka Surat 4</option>
                              <option value={5}>Halaman 5 / Muka Surat 5</option>
                              <option value={6}>Halaman 6 / Muka Surat 6</option>
                            </>
                          ) : (
                            panels.map((p) => (
                              <option key={p.panelNumber} value={p.panelNumber}>
                                Panel {p.panelNumber} ({p.characterName})
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <label className="text-xs font-bold text-slate-700">Jawapan Betul:</label>
                        <select
                          value={q.correctOption}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'correctOption', e.target.value)}
                          className="px-2.5 py-1 text-xs font-black border border-amber-400 bg-amber-100 text-amber-950 rounded-md"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(qIdx)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teks Soalan Objektif
                    </label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                      placeholder="Contoh: Apakah kata sopan yang digunakan oleh Ali?"
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white"
                    />
                  </div>

                  {/* 4 Options Grid */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                      Pilihan Jawapan (A, B, C, D):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <input
                          key={optIdx}
                          type="text"
                          value={opt}
                          onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                          className={`px-3 py-1.5 text-xs rounded-lg border bg-white ${
                            opt.startsWith(`${q.correctOption})`)
                              ? 'border-emerald-400 bg-emerald-50/50 font-bold'
                              : 'border-slate-300 font-medium'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Differentiated Feedback Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        ⚡ Maklum Balas Tahap 1 (Ayat Pendek + Kesan Bunyi Manga):
                      </label>
                      <input
                        type="text"
                        value={q.explanationTahap1}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'explanationTahap1', e.target.value)}
                        placeholder="Contoh: Zzzap! 'Sila' ialah kata sopan untuk menjemput orang!"
                        className="w-full px-3 py-1.5 text-xs border border-amber-200 rounded-lg bg-amber-50/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                        📖 Maklum Balas Tahap 2 (Huraian Tatabahasa DSKP):
                      </label>
                      <input
                        type="text"
                        value={q.explanationTahap2}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'explanationTahap2', e.target.value)}
                        placeholder="Contoh: Kata 'sila' ialah kata perintah jenis silaan yang sopan..."
                        className="w-full px-3 py-1.5 text-xs border border-indigo-200 rounded-lg bg-indigo-50/40"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSubTab('koleksi')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Simpan & Terbitkan Komik ke Portal Murid
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Bina Automatik dengan AI Sensei BM */}
      {activeSubTab === 'bina_ai' && (
        <div className="bg-white rounded-2xl p-6 border-2 border-indigo-200 shadow-sm max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-100 text-indigo-700 mb-3 border border-indigo-200">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Jana Bahan Komik & Soalan Automatik
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Sensei BM dikuasakan oleh kecerdasan buatan untuk merangka jalan cerita komik manga beserta set soalan objektif yang selaras dengan DSKP KSSR Semakan.
            </p>
          </div>

          <form onSubmit={handleGenerateAiComic} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fokus Tatabahasa / Topik Pembelajaran:
              </label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Contoh: Kata Tanya, Penjodoh Bilangan, Peribahasa, Kata Adjektif"
                required
                className="w-full px-3.5 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tahap Murid Sasaran:
                </label>
                <select
                  value={aiTahap}
                  onChange={(e) => setAiTahap(e.target.value as TahapLevel)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Tahap 1">Tahap 1 (Tahun 1, 2, 3)</option>
                  <option value="Tahap 2">Tahap 2 (Tahun 4, 5, 6)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Watak Utama Komik:
                </label>
                <input
                  type="text"
                  value={aiCharacters}
                  onChange={(e) => setAiCharacters(e.target.value)}
                  placeholder="Contoh: Ali, Danial, Cikgu Sarah"
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Latar Tempat / Suasana Babak:
              </label>
              <input
                type="text"
                value={aiSetting}
                onChange={(e) => setAiSetting(e.target.value)}
                placeholder="Contoh: Bilik Darjah, Kantin Sekolah, Kebun Sayur Tok Wan"
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white"
              />
            </div>

            {isAiGenerating && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs flex items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-600 shrink-0" />
                <div>
                  <span className="font-bold block">Sedang Menjana Bahan Komik...</span>
                  <p>{aiStatusMsg}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isAiGenerating}
              className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isAiGenerating ? 'Sensei BM Sedang Mengarang...' : 'Jana Komik & Set Soalan Sekarang'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Submissions / Rekod Markah Murid */}
      {activeSubTab === 'submissions' && (
        <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                Rekod Pentaksiran & Markah Murid ({submissions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Semakan keputusan latihan objektif murid yang telah dihantar.
              </p>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              Belum ada rekod murid dihantar. Murid boleh menjawab kuiz dari Portal Murid.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Tarikh</th>
                    <th className="py-2.5 px-3">Nama Murid</th>
                    <th className="py-2.5 px-3">Komik / Cerita</th>
                    <th className="py-2.5 px-3">Tahap</th>
                    <th className="py-2.5 px-3">Markah</th>
                    <th className="py-2.5 px-3">Peratus</th>
                    <th className="py-2.5 px-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-amber-50/30">
                      <td className="py-3 px-3 text-slate-500">{sub.submittedAt}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{sub.studentName}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">{sub.comicTitle}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                          {sub.tahap}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {sub.score} / {sub.total}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-black font-mono px-2 py-0.5 rounded-md ${
                            sub.percentage >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.percentage >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {sub.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                        >
                          Lihat Kad Keputusan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <ResultCardModal
          submission={selectedSubmission}
          isOpen={true}
          onClose={() => setSelectedSubmission(null)}
          onRetake={() => setSelectedSubmission(null)}
        />
      )}

      {/* Publication Success Celebration Modal */}
      {publishedSuccessComic && (
        <PublicationSuccessModal
          comic={publishedSuccessComic}
          isOpen={Boolean(publishedSuccessComic)}
          onClose={() => setPublishedSuccessComic(null)}
          onReadNow={() => {
            const c = publishedSuccessComic;
            setPublishedSuccessComic(null);
            onPreviewComic(c);
          }}
          onGoToMuridPortal={() => {
            const c = publishedSuccessComic;
            setPublishedSuccessComic(null);
            if (onNavigateToMuridPortal) {
              onNavigateToMuridPortal(c);
            }
          }}
        />
      )}

      {/* Share Link Modal for Phones & Tablets */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-emerald-400 relative">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white text-center relative">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setIsCopied(false);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Share2 className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-black text-white">
                Kongsi Pautan Portal Murid
              </h3>
              <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
                Boleh diakses terus oleh murid, ibu bapa, dan guru lain menggunakan <strong>Telefon Pintar, Tablet, atau Laptop</strong>!
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Pautan Rasmi Web (Salin untuk Dikongsi):
                </label>
                <div className="flex items-center gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-300">
                  <input
                    type="text"
                    readOnly
                    value="https://ais-pre-tidfj2oodw7gew3qzlozzh-146412038061.asia-southeast1.run.app"
                    className="w-full text-xs font-mono font-bold bg-transparent text-slate-800 outline-none select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("https://ais-pre-tidfj2oodw7gew3qzlozzh-146412038061.asia-southeast1.run.app");
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 3000);
                    }}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1 shrink-0 ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-xs'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Disalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Salin
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isCopied && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pautan telah disalin ke papan keratan (clipboard)! Sedia dihantar ke WhatsApp atau Telegram.</span>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block">
                  Cara Murid Buka di Telefon / Tablet:
                </span>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Hantar pautan di atas ke kumpulan WhatsApp / Telegram kelas.</li>
                  <li>Murid atau ibu bapa hanya perlu tekan pautan tersebut.</li>
                  <li>Aplikasi akan terus dibuka dalam pelayar (Chrome/Safari) tanpa perlu log masuk atau muat turun apa-apa aplikasi.</li>
                  <li>Murid boleh terus tekan butang <strong>Skrin Penuh</strong> untuk membaca komik secara menatal ke bawah!</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  setIsCopied(false);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
