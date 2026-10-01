import React, { useState } from 'react';
import { GURU_PASSWORD, MURID_PASSWORD, COMIC_WARNING_MESSAGE } from '../utils/storage';
import { ShieldCheck, UserCheck, KeyRound, AlertTriangle, X } from 'lucide-react';

interface AuthModalProps {
  initialRole: 'guru' | 'murid';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: 'guru' | 'murid') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialRole,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [role, setRole] = useState<'guru' | 'murid'>(initialRole);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (role === 'guru') {
      if (password === GURU_PASSWORD) {
        onSuccess('guru');
        onClose();
        setPassword('');
      } else {
        triggerError();
      }
    } else {
      if (password === MURID_PASSWORD) {
        onSuccess('murid');
        onClose();
        setPassword('');
      } else {
        triggerError();
      }
    }
  };

  const triggerError = () => {
    setErrorMsg(COMIC_WARNING_MESSAGE);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleQuickFill = (preset: 'guru' | 'murid') => {
    setRole(preset);
    setPassword(preset === 'guru' ? GURU_PASSWORD : MURID_PASSWORD);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-300 relative transition-transform ${
          isShaking ? 'translate-x-[-8px] rotate-[-1deg]' : ''
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Role Selector Tabs */}
        <div className="flex bg-amber-50 p-1 rounded-xl mb-5 border border-amber-200">
          <button
            type="button"
            onClick={() => {
              setRole('murid');
              setErrorMsg('');
              setPassword('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              role === 'murid'
                ? 'bg-amber-400 text-amber-950 shadow-xs'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Portal Murid
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('guru');
              setErrorMsg('');
              setPassword('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              role === 'guru'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Portal Guru
          </button>
        </div>

        {/* Header Visual */}
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-amber-100 text-amber-800 mb-2 border border-amber-200">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            {role === 'guru' ? 'Pengesahan Akses Guru' : 'Selamat Datang, Wira BM!'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'guru'
              ? 'Sila masukkan kata laluan Guru untuk mengurus bahan komik dan soalan.'
              : 'Masukkan kata laluan murid untuk memulakan pengembaraan membaca komik!'}
          </p>
        </div>

        {/* Error Alert with Comic Styling */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-2.5 animate-in slide-in-from-top-1">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-extrabold block text-rose-800">Amaran Sensei BM:</span>
              <p className="font-medium italic">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kata Laluan {role === 'guru' ? 'Guru' : 'Murid'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={role === 'guru' ? 'Masukkan Guru1234' : 'Masukkan murid123'}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 ${
              role === 'guru'
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-amber-400 hover:bg-amber-500 text-amber-950'
            }`}
          >
            {role === 'guru' ? 'Buka Dashboard Guru' : 'Teruskan Membaca!'}
          </button>
        </form>

        {/* Helpful credential hints */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 mb-2">
            Kata Laluan Rasmi Sistem (Klik untuk isi pantas):
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('murid')}
              className="text-xs px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-mono font-medium transition-colors"
            >
              Murid: <span className="font-bold underline">murid123</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('guru')}
              className="text-xs px-2.5 py-1 rounded-md bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-mono font-medium transition-colors"
            >
              Guru: <span className="font-bold underline">Guru1234</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
