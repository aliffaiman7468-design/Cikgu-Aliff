import React, { useState } from 'react';
import { Sparkles, MessageCircle, Send, X, BookCheck, Lightbulb } from 'lucide-react';
import { TahapLevel } from '../types/comic';

interface SenseiMascotProps {
  currentLevel?: TahapLevel;
  activeContextText?: string;
}

export const SenseiMascot: React.FC<SenseiMascotProps> = ({
  currentLevel = 'Tahap 1',
  activeContextText = 'Pembelajaran Komik BM',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'sensei'; text: string }>>([
    {
      sender: 'sensei',
      text:
        currentLevel === 'Tahap 1'
          ? 'Zzzap! Hai Wira BM cilik! Saya Sensei BM! Ada apa-apa perkataan atau tatabahasa yang ingin kamu tanya? Tekan sahaja di sini!'
          : 'Salam Bahasa Melayu! Saya Sensei BM, sedia membantu huraian tatabahasa, imbuhan, kata hubung, dan teknik menjawab pemahaman komik kamu!',
    },
  ]);

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!questionInput.trim() || isLoading) return;

    const userQ = questionInput.trim();
    setQuestionInput('');
    setChatLog((prev) => [...prev, { sender: 'user', text: userQ }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask-sensei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          userLevel: currentLevel,
          contextText: activeContextText,
        }),
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setChatLog((prev) => [...prev, { sender: 'sensei', text: data.answer }]);
      } else {
        setChatLog((prev) => [
          ...prev,
          {
            sender: 'sensei',
            text:
              currentLevel === 'Tahap 1'
                ? 'Gempak! Cuba semak semula perkataan dalam dialog komik. Perkataan pertama selalunya huruf besar tau!'
                : 'Sila rujuk panduan tatabahasa: pastikan kata kerja transitif diikuti objek tepat, manakala kata kerja tak transitif diikuti pelengkap atau keterangan.',
          },
        ]);
      }
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'sensei',
          text:
            currentLevel === 'Tahap 1'
              ? 'Woshh! Jangan risau! Sensei ada di sini. Teliti belon dialog komik untuk cari jawapan yang tepat!'
              : 'Petua Sensei BM: Analisis jenis kata dalam soalan sama ada kata nama, kata kerja, atau kata adjektif sebelum membuat pilihan.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (q: string) => {
    setQuestionInput(q);
  };

  return (
    <>
      {/* Floating Mascot Trigger */}
      <div className="fixed bottom-5 right-5 z-40 flex items-end gap-3 pointer-events-auto">
        {!isOpen && (
          <div className="hidden sm:flex items-center bg-white/95 px-3.5 py-2 rounded-2xl shadow-lg border border-amber-300 text-xs font-bold text-amber-900 animate-bounce duration-1000 max-w-xs">
            <span>
              {currentLevel === 'Tahap 1' ? '⚡ Tanya Sensei BM!' : '💡 Bimbingan Tatabahasa'}
            </span>
          </div>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative group p-1 bg-amber-400 hover:bg-amber-300 rounded-full shadow-xl border-3 border-amber-600 focus:outline-hidden transition-transform active:scale-95"
          title="Tanya Sensei BM"
        >
          <img
            src="/src/assets/images/mascot_sensei_bm_1790645017380.jpg"
            alt="Sensei BM Mascot"
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-inner"
          />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white"></span>
          </span>
        </button>
      </div>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 right-5 z-50 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border-2 border-amber-300 flex flex-col overflow-hidden max-h-[520px] animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src="/src/assets/images/mascot_sensei_bm_1790645017380.jpg"
                alt="Sensei BM"
                className="w-9 h-9 rounded-full object-cover border border-white"
              />
              <div>
                <h4 className="text-sm font-extrabold flex items-center gap-1.5">
                  Sensei BM
                  <span className="text-[10px] bg-amber-300/30 text-amber-100 px-1.5 py-0.2 rounded-sm border border-amber-300/40">
                    {currentLevel}
                  </span>
                </h4>
                <p className="text-[11px] text-amber-100">Rakan Komik & Guru Pintar BM</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-amber-600/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-3.5 overflow-y-auto flex-1 space-y-3 bg-amber-50/30 text-xs">
            {chatLog.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'sensei' && (
                  <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 mr-2 text-[10px]">
                    BM
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-white rounded-br-none shadow-xs font-medium'
                      : 'bg-white border border-amber-200 text-slate-800 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 italic text-[11px]">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>Sensei BM sedang meneliti kamus Tatabahasa Dewan...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-amber-100 flex gap-1.5 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickQuestion('Apakah contoh kata nama khas dalam komik ini?')}
              className="shrink-0 px-2 py-1 bg-amber-100/70 hover:bg-amber-200 text-amber-900 rounded-md transition-colors"
            >
              Kata Nama Khas?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion('Bagaimana nak bezakan kata hubung dan kata sendi?')}
              className="shrink-0 px-2 py-1 bg-amber-100/70 hover:bg-amber-200 text-amber-900 rounded-md transition-colors"
            >
              Kata Hubung?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion('Beri petua membaca komik dengan teliti.')}
              className="shrink-0 px-2 py-1 bg-amber-100/70 hover:bg-amber-200 text-amber-900 rounded-md transition-colors"
            >
              Petua Membaca
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleAsk} className="p-2.5 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Tanya Sensei BM apa sahaja..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={isLoading || !questionInput.trim()}
              className="p-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
