import React from 'react';
import { ComicStory } from '../types/comic';
import { ComicCoverDisplay } from './ComicCoverDisplay';
import {
  CheckCircle2,
  BookOpen,
  Eye,
  ExternalLink,
  Sparkles,
  ArrowRight,
  FileText,
  X,
} from 'lucide-react';

interface PublicationSuccessModalProps {
  comic: ComicStory;
  isOpen: boolean;
  onClose: () => void;
  onReadNow: () => void;
  onGoToMuridPortal: () => void;
}

export const PublicationSuccessModal: React.FC<PublicationSuccessModalProps> = ({
  comic,
  isOpen,
  onClose,
  onReadNow,
  onGoToMuridPortal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-emerald-400 relative">
        {/* Top Celebration Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white text-center relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-[11px] font-black tracking-wider uppercase bg-emerald-800/60 px-3 py-1 rounded-full text-emerald-200 inline-block mb-1">
            Status: Diterbitkan ke Portal Murid
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            🎉 Komik Berjaya Dimuat Naik!
          </h3>
          <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
            Karya komik anda kini boleh dibaca oleh semua murid di <strong>Portal Murid</strong>.
          </p>
        </div>

        {/* Comic Summary Preview Card */}
        <div className="p-6 space-y-5">
          <div className="flex gap-4 items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-300">
              <ComicCoverDisplay
                coverUrl={comic.coverImage}
                coverType={comic.coverType}
                title={comic.title}
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 inline-block mb-1">
                {comic.tahap} ({comic.yearLevel})
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 truncate">{comic.title}</h4>
              <p className="text-xs text-slate-500 truncate mt-0.5">{comic.topic}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-600 font-semibold">
                <span className="flex items-center gap-1 text-indigo-700 font-bold">
                  {comic.comicFormat === 'pdf' ? (
                    <>
                      <FileText className="w-3 h-3" /> E-Komik PDF
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-3 h-3" /> {comic.panels.length} Panel
                    </>
                  )}
                </span>
                <span>·</span>
                <span>{comic.questions.length} Soalan Kuiz</span>
              </div>
            </div>
          </div>

          {/* Prompt Information */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Anda boleh memilih untuk membuka paparan bacaan sekarang untuk menyemak, atau terus pergi ke Portal Murid untuk melihat kedudukannya dalam senarai komik.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={onReadNow}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Buka & Baca Komik Ini Sekarang
            </button>

            <button
              onClick={onGoToMuridPortal}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Lihat di Portal Murid (Paparan Murid)
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors text-center"
            >
              Tutup & Kembali ke Pengurusan Guru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
