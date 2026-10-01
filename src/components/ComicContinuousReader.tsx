import React, { useState, useEffect, useRef } from 'react';
import { ComicStory, ComicPanel } from '../types/comic';
import { renderAllPdfPages, RenderedPdfPage, dataUrlToBlobUrl } from '../utils/pdfRenderer';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ExternalLink,
  BookOpen,
  Sparkles,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  FileText,
  Layers,
  ArrowUp,
} from 'lucide-react';

interface ComicContinuousReaderProps {
  comic: ComicStory;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
}

export const ComicContinuousReader: React.FC<ComicContinuousReaderProps> = ({
  comic,
  isFullscreen = false,
  onToggleFullscreen,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // PDF Rendering States
  const [pdfPages, setPdfPages] = useState<RenderedPdfPage[]>([]);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ current: 0, total: 0 });
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');

  // Zoom & View Settings
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 75, 100, 125, 150%

  const isPdf = comic.comicFormat === 'pdf' || Boolean(comic.pdfUrl);

  // Load and render PDF pages whenever comic changes
  useEffect(() => {
    let isCancelled = false;

    if (isPdf && comic.pdfUrl) {
      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfPages([]);

      // Create blob URL as backup
      try {
        const bUrl = dataUrlToBlobUrl(comic.pdfUrl);
        setBlobUrl(bUrl);
      } catch (e) {
        console.warn('Could not create blob URL:', e);
      }

      renderAllPdfPages(
        comic.pdfUrl,
        1.6, // High crispness scale
        (loaded, total) => {
          if (!isCancelled) {
            setLoadProgress({ current: loaded, total });
          }
        }
      )
        .then((pages) => {
          if (!isCancelled) {
            setPdfPages(pages);
            setIsLoadingPdf(false);
          }
        })
        .catch((err) => {
          console.error('PDF.js render error:', err);
          if (!isCancelled) {
            setIsLoadingPdf(false);
            setPdfError(
              'Gagal memaparkan halaman secara automatik. Sila gunakan paparan dokumen alternatif di bawah.'
            );
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [comic.id, comic.pdfUrl, isPdf]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 175));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 75));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`flex flex-col bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-xl relative ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : className
      }`}
    >
      {/* Top Reader Controls Bar */}
      <div className="bg-slate-950/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white z-20 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-extrabold text-xs sm:text-sm text-amber-400 truncate flex items-center gap-1.5">
            {isPdf ? <FileText className="w-4 h-4 shrink-0 text-amber-400" /> : <Layers className="w-4 h-4 shrink-0 text-amber-400" />}
            {comic.title}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hidden sm:inline-block shrink-0">
            {isPdf ? `${pdfPages.length > 0 ? `${pdfPages.length} Halaman` : 'Dokumen PDF'}` : `${comic.panels.length} Panel Manga`}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700 text-slate-300">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 75}
              className="p-1 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-700 transition-colors"
              title="Kecilkan Saiz (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 font-bold">{zoomLevel}%</span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 175}
              className="p-1 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-700 transition-colors"
              title="Besarkan Saiz (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 100 && (
              <button
                onClick={handleResetZoom}
                className="p-1 hover:text-amber-400 rounded-lg transition-colors border-l border-slate-700"
                title="Tetapkan Semula (100%)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Full Screen Toggle Button */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                isFullscreen
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold'
              }`}
              title={isFullscreen ? 'Keluar Skrin Penuh (ESC)' : 'Baca Skrin Penuh'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>⛶ Skrin Penuh</span>
                </>
              )}
            </button>
          )}

          {/* Download PDF button if available */}
          {isPdf && comic.pdfUrl && (
            <a
              href={blobUrl || comic.pdfUrl}
              download={comic.pdfFileName || `${comic.title}.pdf`}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700 hidden sm:flex"
              title="Muat Turun Fail PDF"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main Continuous Scroll Area */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 bg-slate-950/90 scroll-smooth relative ${
          isFullscreen ? 'h-[calc(100vh-50px)]' : 'max-h-[680px]'
        }`}
      >
        {/* Loading Spinner for PDF */}
        {isLoadingPdf && (
          <div className="py-24 flex flex-col items-center justify-center text-center text-white space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-300" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">
                Sedang Memuatkan Halaman Komik PDF...
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {loadProgress.total > 0
                  ? `Memproses halaman ${loadProgress.current} daripada ${loadProgress.total}`
                  : 'Sila tunggu sebentar sementara gambar komik disediakan'}
              </p>
            </div>
          </div>
        )}

        {/* Fallback View if PDF.js fails */}
        {pdfError && !isLoadingPdf && (
          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center max-w-lg mx-auto my-12 space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-white">Paparan Komik PDF</h4>
              <p className="text-xs text-slate-400 mt-1">{pdfError}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={blobUrl || comic.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                Buka PDF di Tab Baharu
              </a>
              <a
                href={blobUrl || comic.pdfUrl}
                download={comic.pdfFileName || `${comic.title}.pdf`}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Muat Turun Dokumen
              </a>
            </div>

            {/* Embedded object backup */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <object
                data={blobUrl || comic.pdfUrl}
                type="application/pdf"
                className="w-full h-96 rounded-xl border border-slate-700 bg-white"
              >
                <p className="text-xs text-slate-400">Pelayar anda tidak menyokong paparan PDF terus.</p>
              </object>
            </div>
          </div>
        )}

        {/* CASE 1: Rendered PDF Pages Stacked Vertically */}
        {isPdf && pdfPages.length > 0 && (
          <div
            className="flex flex-col items-center space-y-6 mx-auto transition-all duration-200"
            style={{ maxWidth: `${Math.round(zoomLevel * 8)}px` }}
          >
            {pdfPages.map((page) => (
              <div
                key={page.pageNumber}
                className="w-full flex flex-col items-center group relative shadow-2xl rounded-2xl overflow-hidden bg-white border border-slate-800"
              >
                {/* Page Number Sticker */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-slate-900/90 text-amber-300 font-black text-[11px] px-2.5 py-1 rounded-md border border-amber-400/40 shadow-md">
                    Halaman {page.pageNumber} / {pdfPages.length}
                  </span>
                </div>

                {/* PDF Page Canvas Image */}
                <img
                  src={page.dataUrl}
                  alt={`Halaman Komik ${page.pageNumber}`}
                  className="w-full h-auto object-contain select-none"
                  loading="lazy"
                />
              </div>
            ))}

            {/* End of comic reader banner */}
            <div className="w-full py-8 text-center text-slate-400 text-xs border-t border-slate-800 mt-6 flex flex-col items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[11px]">
                🎉 Tahniah! Kamu telah membaca kesemua {pdfPages.length} halaman komik ini!
              </span>
              <p className="text-slate-500 text-[11px]">
                Sekarang, kamu boleh kembali ke soalan latihan di sebelah kanan untuk menguji kefahaman!
              </p>
              <button
                onClick={scrollToTop}
                className="mt-2 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowUp className="w-3.5 h-3.5" /> Skrol Semula ke Atas
              </button>
            </div>
          </div>
        )}

        {/* CASE 2: Manga Panels Stacked Vertically (Continuous Webtoon Scroll) */}
        {!isPdf && comic.panels && comic.panels.length > 0 && (
          <div
            className="flex flex-col items-center space-y-6 mx-auto transition-all duration-200"
            style={{ maxWidth: `${Math.round(zoomLevel * 8)}px` }}
          >
            {comic.panels.map((panel, idx) => (
              <div
                key={panel.id}
                className="w-full bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl relative"
              >
                {/* Panel Header */}
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-white">
                  <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md text-[11px]">
                    Panel #{idx + 1}
                  </span>
                  {panel.characterName && (
                    <span className="text-slate-300 font-bold">
                      Watak: <strong className="text-amber-300">{panel.characterName}</strong>
                    </span>
                  )}
                </div>

                {/* Panel Image */}
                <div className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                  {panel.imageUrl ? (
                    <img
                      src={panel.imageUrl}
                      alt={`Panel ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      <BookOpen className="w-12 h-12 mx-auto text-amber-400 mb-2" />
                      <p className="text-xs">Tiada imej panel</p>
                    </div>
                  )}

                  {/* Comic Sound Effect */}
                  {panel.soundEffect && (
                    <div className="absolute top-4 right-4 z-10 transform rotate-3">
                      <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-lg border-2 border-slate-950 shadow-md uppercase">
                        {panel.soundEffect}
                      </span>
                    </div>
                  )}
                </div>

                {/* Panel Dialogue Balloon & Narration */}
                <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
                  {panel.dialogue && (
                    <div className="bg-white rounded-2xl p-3 border-2 border-slate-800 shadow-md text-slate-900 relative">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-sm">
                          {panel.characterName || 'Watak'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                        "{panel.dialogue}"
                      </p>
                    </div>
                  )}

                  {panel.narration && (
                    <p className="text-xs text-slate-400 italic px-1">
                      📖 {panel.narration}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* End of comic panels banner */}
            <div className="w-full py-6 text-center text-slate-400 text-xs border-t border-slate-800 mt-4 flex flex-col items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[11px]">
                🎉 Kamu telah membaca kesemua {comic.panels.length} panel komik ini!
              </span>
              <button
                onClick={scrollToTop}
                className="mt-2 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowUp className="w-3.5 h-3.5" /> Skrol Semula ke Atas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Hint Bar */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-[11px]">
          <ChevronDown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          Skrol ke bawah untuk membaca muka surat seterusnya
        </span>
        <button
          onClick={scrollToTop}
          className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1"
        >
          <ArrowUp className="w-3 h-3" /> Atas
        </button>
      </div>
    </div>
  );
};
