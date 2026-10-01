import React, { useState, useEffect } from 'react';
import { ComicStory, StudentSubmission, TahapLevel } from '../types/comic';
import { evaluateStudentSubmission } from '../utils/evaluator';
import { saveSubmission } from '../utils/storage';
import { ResultCardModal } from './ResultCardModal';
import { ComicContinuousReader } from './ComicContinuousReader';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  CheckCircle,
  Eye,
  Maximize2,
  Volume2,
  FileText,
  ExternalLink,
  Download,
  Layers,
} from 'lucide-react';

interface ComicReaderViewProps {
  comic: ComicStory;
  onBack: () => void;
  userLevel?: TahapLevel;
}

export const ComicReaderView: React.FC<ComicReaderViewProps> = ({
  comic,
  onBack,
  userLevel = 'Tahap 1',
}) => {
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  const [studentName, setStudentName] = useState('Wira Cilik');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<StudentSubmission | null>(null);
  const [audioSpeaking, setAudioSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mangaViewMode, setMangaViewMode] = useState<'continuous' | 'single'>('continuous');

  const panels = comic.panels || [];
  const questions = comic.questions || [];
  const currentPanel = panels[activePanelIndex] || panels[0];
  const isPdf = comic.comicFormat === 'pdf' || Boolean(comic.pdfUrl);

  // Listen to Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleSelectOption = (qId: string, optionLetter: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionLetter,
    }));
  };

  const handleNextPanel = () => {
    if (activePanelIndex < panels.length - 1) {
      setActivePanelIndex((prev) => prev + 1);
    }
  };

  const handlePrevPanel = () => {
    if (activePanelIndex > 0) {
      setActivePanelIndex((prev) => prev - 1);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === questions.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submission = evaluateStudentSubmission(
      comic,
      answers,
      studentName.trim() || 'Wira BM',
      comic.tahap
    );
    saveSubmission(submission);
    setCurrentSubmission(submission);
    setShowResultModal(true);
  };

  const handleRetake = () => {
    setAnswers({});
    setShowResultModal(false);
  };

  // Text-to-speech accessibility for primary students
  const handleReadDialogue = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ms-MY';
      utterance.rate = 0.9;
      utterance.onstart = () => setAudioSpeaking(true);
      utterance.onend = () => setAudioSpeaking(false);
      utterance.onerror = () => setAudioSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-amber-800 bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs hover:bg-amber-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Koleksi
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
            {comic.tahap} ({comic.yearLevel})
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
            {comic.topic}
          </span>
        </div>
      </div>

      {/* Fullscreen Reader Overlay */}
      {isFullscreen && (
        <ComicContinuousReader
          comic={comic}
          isFullscreen={true}
          onToggleFullscreen={() => setIsFullscreen(false)}
        />
      )}

      {/* Main Two-Zone Stage */}
      <div className={`grid grid-cols-1 ${questions.length > 0 ? 'lg:grid-cols-12' : 'max-w-4xl mx-auto'} gap-6 items-start`}>
        {/* Left Zone: The Manga Stage (Panels & Storyline or PDF Viewer) */}
        <div className={`${questions.length > 0 ? 'lg:col-span-7' : 'w-full'} bg-white rounded-3xl p-4 sm:p-6 border-2 border-amber-300 shadow-md`}>
          {/* Comic Title & Panel/PDF Indicator */}
          <div className="flex flex-wrap items-center justify-between border-b border-amber-100 pb-3 mb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {comic.title}
                </h2>
                {isPdf && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Fail PDF
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{comic.synopsis}</p>
            </div>

            <div className="flex items-center gap-2">
              {!isPdf && (
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setMangaViewMode('continuous')}
                    className={`px-2.5 py-1 font-bold rounded-lg transition-colors ${
                      mangaViewMode === 'continuous'
                        ? 'bg-amber-400 text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Skrol Menegak
                  </button>
                  <button
                    type="button"
                    onClick={() => setMangaViewMode('single')}
                    className={`px-2.5 py-1 font-bold rounded-lg transition-colors ${
                      mangaViewMode === 'single'
                        ? 'bg-amber-400 text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Satu Persatu
                  </button>
                </div>
              )}

              {/* Big Fullscreen Button */}
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="px-3.5 py-1.5 text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                title="Buka Skrin Penuh untuk membaca dengan selesa"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Skrin Penuh</span>
              </button>
            </div>
          </div>

          {/* Conditional Display: Continuous Scroll Mode (Default) vs Manga Panel Carousel Mode */}
          {isPdf || mangaViewMode === 'continuous' ? (
            <div className="space-y-4">
              <ComicContinuousReader
                comic={comic}
                isFullscreen={false}
                onToggleFullscreen={() => setIsFullscreen(true)}
              />
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-medium">
                  📖 <strong>Petua Membaca:</strong> Skrol ke bawah untuk membaca seluruh halaman komik, atau tekan <strong>Skrin Penuh</strong> untuk paparan lebih luas!
                </span>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="shrink-0 px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg flex items-center gap-1 transition-colors self-start sm:self-auto"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Buka Skrin Penuh
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Active Manga Panel Frame */}
              {currentPanel && (
                <div className="relative rounded-2xl overflow-hidden border-4 border-slate-900 bg-slate-950 shadow-lg">
                  {/* Manga Panel Image */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                    {currentPanel.imageUrl ? (
                      <img
                        src={currentPanel.imageUrl}
                        alt={`Panel ${currentPanel.panelNumber}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-radial from-amber-600/30 to-slate-950 p-6 text-center text-amber-100">
                        <Sparkles className="w-12 h-12 text-amber-400 mb-2 animate-pulse" />
                        <span className="font-extrabold text-lg">Panel {currentPanel.panelNumber}</span>
                        <p className="text-xs text-slate-300 mt-1">{currentPanel.narration}</p>
                      </div>
                    )}

                    {/* Comic Sound Effect Sticker */}
                    {currentPanel.soundEffect && (
                      <div className="absolute top-4 right-4 z-10 transform rotate-6 hover:rotate-0 transition-transform">
                        <span className="bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-3 py-1 rounded-lg border-2 border-slate-950 shadow-md uppercase tracking-wider">
                          {currentPanel.soundEffect}
                        </span>
                      </div>
                    )}

                    {/* Character Name Tag */}
                    <div className="absolute bottom-4 left-4 z-10">
                      <span className="bg-slate-900/90 text-amber-300 border border-amber-400/50 text-xs font-extrabold px-3 py-1 rounded-md shadow-sm">
                        Watak: {currentPanel.characterName}
                      </span>
                    </div>
                  </div>

                  {/* Speech Bubble & Dialogue Bar */}
                  <div className="bg-amber-50/95 p-4 sm:p-5 border-t-3 border-slate-900 relative">
                    {/* Speech pointer triangle */}
                    <div className="absolute -top-3 left-8 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-amber-50" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold text-slate-900 text-sm">
                            💬 {currentPanel.characterName}:
                          </span>
                        </div>
                        <blockquote className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                          "{currentPanel.dialogue}"
                        </blockquote>
                        {currentPanel.narration && (
                          <p className="text-xs text-slate-600 mt-2 italic font-medium">
                            📖 <span className="font-semibold">Pencerita:</span> {currentPanel.narration}
                          </p>
                        )}
                      </div>

                      {/* Audio Listen Button */}
                      <button
                        onClick={() => handleReadDialogue(`${currentPanel.characterName} berkata: ${currentPanel.dialogue}`)}
                        className="p-2.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 transition-colors shrink-0 shadow-xs"
                        title="Dengar sebutan dialog"
                      >
                        <Volume2 className={`w-5 h-5 ${audioSpeaking ? 'animate-pulse text-amber-700' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Panel Selector & Navigation Controls */}
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={handlePrevPanel}
                  disabled={activePanelIndex === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 transition-colors flex items-center gap-1 border border-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Panel Lepas
                </button>

                {/* Thumbnail navigation pill dots */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {panels.map((p, idx) => (
                    <button
                      key={p.id || idx}
                      onClick={() => setActivePanelIndex(idx)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all border ${
                        activePanelIndex === idx
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      P{idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextPanel}
                  disabled={activePanelIndex === panels.length - 1}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-amber-950 transition-colors flex items-center gap-1 shadow-xs"
                >
                  Panel Seterusnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Zone: Objective Assessment Deck */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-md">
          {/* Header Assessment */}
          <div className="border-b border-amber-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Latihan & Pentaksiran Objektif
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                Uji Pemahaman Komik BM
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-600">
                Dijawab: <span className="font-mono text-amber-700">{answeredCount}/{questions.length}</span>
              </span>
            </div>
          </div>

          {/* Student Profile Input */}
          <div className="mb-4 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
            <label className="block text-[11px] font-bold text-amber-950 mb-1">
              Nama Wira BM (Murid):
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Contoh: Danial Wira"
              className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Questions Container */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, qIndex) => {
              const selectedOption = answers[q.id] || '';
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    activeQuestionIndex === qIndex
                      ? 'border-amber-400 bg-amber-50/40 shadow-xs ring-1 ring-amber-300'
                      : 'border-slate-200 bg-white hover:border-amber-200'
                  }`}
                  onClick={() => {
                    setActiveQuestionIndex(qIndex);
                    // Automatically jump to the referenced panel if available!
                    if (q.panelRef && q.panelRef >= 1 && q.panelRef <= panels.length) {
                      setActivePanelIndex(q.panelRef - 1);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                      Soalan {qIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActivePanelIndex(q.panelRef - 1)}
                      className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Rujuk Panel {q.panelRef}
                    </button>
                  </div>

                  <p className="text-sm font-bold text-slate-800 leading-snug mb-3">
                    {q.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const letter = opt.substring(0, 1).toUpperCase();
                      const isSelected = selectedOption === letter;

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(q.id, letter)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 border-amber-600 shadow-2xs ring-1 ring-amber-500'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <CheckCircle className="w-4 h-4 text-slate-950 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Submission Section */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isAllAnswered}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isAllAnswered
                  ? 'Hantar Jawapan & Jana Kad Keputusan'
                  : `Sila Jawab Semua Soalan (${answeredCount}/${questions.length})`}
              </button>
              <p className="text-[11px] text-center text-slate-500 mt-2">
                Sensei BM akan menilai jawapan kamu serta-merta dan memberikan petua tatabahasa.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Result Card Modal */}
      {currentSubmission && (
        <ResultCardModal
          submission={currentSubmission}
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
};
