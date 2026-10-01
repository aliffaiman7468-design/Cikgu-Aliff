import React, { useState } from 'react';
import { ComicStory, TahapLevel } from '../types/comic';
import { BookOpen, Sparkles, Filter, Search, Award, CheckCircle2 } from 'lucide-react';
import { ComicCoverDisplay } from './ComicCoverDisplay';

interface MuridPortalProps {
  comics: ComicStory[];
  onSelectComic: (comic: ComicStory) => void;
  onOpenGuruLogin: () => void;
}

export const MuridPortal: React.FC<MuridPortalProps> = ({
  comics,
  onSelectComic,
  onOpenGuruLogin,
}) => {
  const [selectedTahap, setSelectedTahap] = useState<'Semua' | TahapLevel>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const publishedComics = comics.filter((c) => c.isPublished !== false);

  const filteredComics = publishedComics.filter((c) => {
    const matchesTahap = selectedTahap === 'Semua' || c.tahap === selectedTahap;
    const matchesQuery =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.synopsis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTahap && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner with Manga Spirit */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 p-6 sm:p-10 shadow-lg border-2 border-amber-300 mb-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/30 backdrop-blur-md text-amber-950 text-xs font-bold mb-3 border border-white/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-950" />
            Pengembaraan Bahasa Melayu Sekolah Rendah
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            Belajar Bahasa Melayu Lebih Seronok Bersama Manga & Komik!
          </h1>
          <p className="mt-2 text-xs sm:text-base font-medium text-amber-950/90 leading-relaxed">
            Pilih mana-mana komik kegemaran kamu, hayati dialog watak, dan uji kemahiran tatabahasa bersama Sensei BM!
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-900 bg-white/70 px-3 py-1.5 rounded-xl border border-white/60">
              🎯 Mengikut Sukatan DSKP KSSR Semakan
            </span>
            <span className="text-xs font-bold text-slate-900 bg-white/70 px-3 py-1.5 rounded-xl border border-white/60">
              ⚡ Tahap 1 & Tahap 2
            </span>
          </div>
        </div>

        {/* Mascot badge in hero banner */}
        <div className="hidden lg:block absolute -right-4 -bottom-6 w-56 h-56 rounded-full overflow-hidden border-4 border-white/60 shadow-xl">
          <img
            src="/src/assets/images/mascot_sensei_bm_1790645017380.jpg"
            alt="Sensei BM Hero"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs">
        {/* Tahap Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-amber-50 rounded-xl border border-amber-100 overflow-x-auto">
          {(['Semua', 'Tahap 1', 'Tahap 2'] as const).map((tahap) => (
            <button
              key={tahap}
              type="button"
              onClick={() => setSelectedTahap(tahap)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                selectedTahap === tahap
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {tahap === 'Semua' ? 'Semua Tahap' : `${tahap} (${tahap === 'Tahap 1' ? 'Tahun 1-3' : 'Tahun 4-6'})`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tajuk, topik tatabahasa..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Comics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComics.map((comic) => (
          <div
            key={comic.id}
            className="group bg-white rounded-2xl overflow-hidden border-2 border-amber-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col"
          >
            {/* Cover Image Frame */}
            <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
              <ComicCoverDisplay
                coverUrl={comic.coverImage}
                coverType={comic.coverType}
                title={comic.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-xs border border-amber-500">
                  {comic.tahap}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                  {comic.yearLevel}
                </span>
                {(comic.comicFormat === 'pdf' || comic.pdfUrl) && (
                  <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-600 text-white shadow-xs">
                    📄 E-Komik PDF
                  </span>
                )}
                {(comic.author?.includes('Guru') || comic.id.includes('upload')) && (
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Karya Guru
                  </span>
                )}
              </div>
              <div className="absolute bottom-3 right-3 z-20">
                <span className="text-[11px] font-mono font-bold bg-slate-900/90 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/30">
                  {comic.comicFormat === 'pdf' || comic.pdfUrl
                    ? `📄 PDF · ${comic.questions.length} Soalan`
                    : `${comic.panels.length} Panel · ${comic.questions.length} Soalan`}
                </span>
              </div>
            </div>

            {/* Comic Info Body */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide mb-1">
                  📌 {comic.topic}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-amber-800 transition-colors">
                  {comic.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {comic.synopsis}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {comic.author}
                </span>
                <button
                  onClick={() => onSelectComic(comic)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-2xs group-hover:bg-amber-500 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Mula Baca & Kuiz
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredComics.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-amber-300 p-6">
          <BookOpen className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">Tiada komik dijumpai</h4>
          <p className="text-xs text-slate-500 mt-1">
            Cuba cari dengan kata kunci lain atau pilih pilihan "Semua Tahap".
          </p>
        </div>
      )}
    </div>
  );
};
