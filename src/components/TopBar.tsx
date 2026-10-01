import React from 'react';
import { BookOpen, GraduationCap, ShieldCheck, User, LogOut, Sparkles, Download } from 'lucide-react';

interface TopBarProps {
  currentRole: 'guru' | 'murid' | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLoginModal: (role: 'guru' | 'murid') => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  onOpenLoginModal,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('murid_koleksi')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-xl shadow-sm border border-amber-600/30 group-hover:scale-105 transition-transform">
                <span className="tracking-tighter">BM</span>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Sensei BM
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/60 hidden sm:inline-block">
                    Komik & Manga
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 hidden md:block">
                  Pembelajaran Bahasa Melayu Sekolah Rendah
                </p>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('murid_koleksi')}
              className={`transition-colors flex items-center gap-1.5 py-1 text-xs sm:text-sm font-semibold ${
                activeTab === 'murid_koleksi'
                  ? 'text-amber-800 border-b-2 border-amber-500'
                  : 'hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              Koleksi Komik
            </button>

            {currentRole === 'guru' && (
              <>
                <button
                  onClick={() => onSelectTab('guru_builder')}
                  className={`transition-colors flex items-center gap-1.5 py-1 text-xs sm:text-sm font-semibold ${
                    activeTab === 'guru_builder'
                      ? 'text-amber-800 border-b-2 border-amber-500'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Bina Komik & Soalan
                </button>
                <button
                  onClick={() => onSelectTab('guru_submissions')}
                  className={`transition-colors flex items-center gap-1.5 py-1 text-xs sm:text-sm font-semibold ${
                    activeTab === 'guru_submissions'
                      ? 'text-amber-800 border-b-2 border-amber-500'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  Rekod & Semakan Murid
                </button>
              </>
            )}

            <button
              onClick={() => onSelectTab('panduan')}
              className={`transition-colors py-1 text-xs sm:text-sm font-medium ${
                activeTab === 'panduan'
                  ? 'text-amber-800 border-b-2 border-amber-500'
                  : 'hover:text-slate-900'
              }`}
            >
              Panduan DSKP
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Download Project ZIP Button */}
            <a
              href="/sensei-bm-projek-lengkap.zip"
              download="sensei-bm-projek-lengkap.zip"
              className="px-3 py-1.5 text-xs font-black text-amber-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-yellow-200 border border-amber-400 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              title="Muat turun keseluruhan laman web ini sebagai fail ZIP untuk dibuka di komputer/laptop secara offline"
            >
              <Download className="w-3.5 h-3.5 text-amber-950" />
              <span className="hidden md:inline">Muat Turun Fail (ZIP)</span>
              <span className="md:hidden">Fail ZIP</span>
            </a>

            {currentRole ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1">
                    {currentRole === 'guru' ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 inline" />
                        Portal Guru (Disahkan)
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5 text-emerald-600 inline" />
                        Portal Wira Murid
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {currentRole === 'guru' ? 'Guru1234' : 'murid123'}
                  </div>
                </div>

                {currentRole === 'murid' && (
                  <button
                    onClick={() => onOpenLoginModal('guru')}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
                  >
                    Beralih ke Guru
                  </button>
                )}

                {currentRole === 'guru' && (
                  <button
                    onClick={() => onSelectTab('murid_koleksi')}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
                  >
                    Pratonton Murid
                  </button>
                )}

                <button
                  onClick={onLogout}
                  title="Log Keluar"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenLoginModal('murid')}
                  className="px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs whitespace-nowrap"
                >
                  Masuk Murid
                </button>
                <button
                  onClick={() => onOpenLoginModal('guru')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 whitespace-nowrap"
                >
                  Masuk Guru
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
