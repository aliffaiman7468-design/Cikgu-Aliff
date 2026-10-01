/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { MuridPortal } from './components/MuridPortal';
import { ComicReaderView } from './components/ComicReaderView';
import { GuruPortal } from './components/GuruPortal';
import { PanduanView } from './components/PanduanView';
import { AuthModal } from './components/AuthModal';
import { SenseiMascot } from './components/SenseiMascot';
import { ComicStory } from './types/comic';
import {
  getStoredComics,
  initStorage,
  getCurrentUserRole,
  setCurrentUserRole,
} from './utils/storage';

export default function App() {
  const [comics, setComics] = useState<ComicStory[]>(() => getStoredComics());
  const [currentRole, setCurrentRole] = useState<'guru' | 'murid' | null>(() => {
    // Default to 'murid' to provide instant access to stories, or stored role
    return getCurrentUserRole() || 'murid';
  });
  const [activeTab, setActiveTab] = useState<string>('murid_koleksi');
  const [selectedComic, setSelectedComic] = useState<ComicStory | null>(null);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTargetRole, setAuthTargetRole] = useState<'guru' | 'murid'>('murid');

  useEffect(() => {
    initStorage().then((loaded) => {
      setComics([...loaded]);
    });
  }, []);

  const handleRefreshComics = () => {
    setComics([...getStoredComics()]);
  };

  const handleNavigateToMuridPortal = (comic?: ComicStory) => {
    setComics([...getStoredComics()]);
    if (comic) {
      setSelectedComic(comic);
    } else {
      setSelectedComic(null);
      setActiveTab('murid_koleksi');
    }
  };

  const handleOpenLogin = (role: 'guru' | 'murid') => {
    setAuthTargetRole(role);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (role: 'guru' | 'murid') => {
    setCurrentRole(role);
    setCurrentUserRole(role);
    if (role === 'guru') {
      setActiveTab('guru_builder');
    } else {
      setActiveTab('murid_koleksi');
    }
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setCurrentUserRole(null);
    setSelectedComic(null);
    setActiveTab('murid_koleksi');
  };

  const handleSelectTab = (tab: string) => {
    if (tab === 'guru_builder' || tab === 'guru_submissions') {
      if (currentRole !== 'guru') {
        handleOpenLogin('guru');
        return;
      }
    }
    setSelectedComic(null);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-slate-800">
      {/* Top Bar Contract (Single Line Brand, Links, Primary Action) */}
      <TopBar
        currentRole={currentRole}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenLoginModal={handleOpenLogin}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {selectedComic ? (
          <ComicReaderView
            comic={selectedComic}
            userLevel={selectedComic.tahap}
            onBack={() => setSelectedComic(null)}
          />
        ) : activeTab === 'guru_builder' || activeTab === 'guru_submissions' ? (
          currentRole === 'guru' ? (
            <GuruPortal
              comics={comics}
              onRefreshComics={handleRefreshComics}
              onPreviewComic={(c) => setSelectedComic(c)}
              onNavigateToMuridPortal={handleNavigateToMuridPortal}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 text-center p-6 bg-white rounded-2xl border-2 border-indigo-200 shadow-md">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Akses Terhad untuk Guru Sahaja
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Sila masukkan kata laluan Guru (<code>Guru1234</code>) untuk mengakses dashboard pengurusan.
              </p>
              <button
                onClick={() => handleOpenLogin('guru')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Log Masuk Guru
              </button>
            </div>
          )
        ) : activeTab === 'panduan' ? (
          <PanduanView />
        ) : (
          <MuridPortal
            comics={comics}
            onSelectComic={(comic) => setSelectedComic(comic)}
            onOpenGuruLogin={() => handleOpenLogin('guru')}
          />
        )}
      </main>

      {/* Floating Sensei BM Mascot & Tutor */}
      <SenseiMascot
        currentLevel={selectedComic ? selectedComic.tahap : 'Tahap 1'}
        activeContextText={
          selectedComic
            ? `Komik: ${selectedComic.title}. Fokus: ${selectedComic.topic}`
            : 'Pembelajaran Bahasa Melayu Sekolah Rendah'
        }
      />

      {/* Password Authentication Modal */}
      <AuthModal
        initialRole={authTargetRole}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Clean Footer */}
      <footer className="bg-white border-t border-amber-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <span>Sensei BM</span>
            <span aria-hidden="true">·</span>
            <span className="font-normal text-slate-500">
              Aplikasi Pembelajaran Bahasa Melayu Berasaskan Komik & Manga
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Kurikulum Standard Sekolah Rendah (DSKP KSSR Semakan)</span>
            <span aria-hidden="true">·</span>
            <span>Tahap 1 & Tahap 2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
