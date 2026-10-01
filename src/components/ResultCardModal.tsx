import React, { useState } from 'react';
import { StudentSubmission } from '../types/comic';
import { generateMarkdownResultCard } from '../utils/evaluator';
import { CheckCircle2, XCircle, Copy, Check, ArrowLeft, RotateCcw, Share2, Award, BookOpen } from 'lucide-react';

interface ResultCardModalProps {
  submission: StudentSubmission;
  isOpen: boolean;
  onClose: () => void;
  onRetake: () => void;
}

export const ResultCardModal: React.FC<ResultCardModalProps> = ({
  submission,
  isOpen,
  onClose,
  onRetake,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'markdown'>('visual');

  if (!isOpen) return null;

  const markdownString = generateMarkdownResultCard(submission);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownString], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Keputusan_${submission.studentName}_${submission.comicTitle.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl border-2 border-amber-300 flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">
              Keputusan Pentaksiran Komik BM
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'visual' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Kad Visual
              </button>
              <button
                onClick={() => setViewMode('markdown')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'markdown' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Teks Markdown
              </button>
            </div>

            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin!' : 'Salin Markdown'}
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 bg-amber-50/20">
          {viewMode === 'markdown' ? (
            <div className="bg-slate-950 text-emerald-300 p-5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
              <pre>{markdownString}</pre>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header Box */}
              <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mb-3 border border-amber-300">
                  <span className="text-2xl font-black">📊</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Kad Keputusan Latihan Komik BM
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Komik: <span className="font-semibold text-slate-900">{submission.comicTitle}</span>
                </p>

                {/* Score & Status Bar */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Murid:</span>
                    <span className="font-bold text-slate-900">{submission.studentName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✅ Selesai
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Markah:</span>
                    <span className="font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300 font-mono">
                      {submission.score}/{submission.total} ({submission.percentage}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Ulasan Sensei BM */}
              <div className="bg-amber-100/60 rounded-2xl p-5 border border-amber-300 shadow-xs relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🌟</span>
                  <h4 className="text-sm font-extrabold text-amber-950 uppercase tracking-wide">
                    Ulasan Sensei BM
                  </h4>
                </div>
                <blockquote className="pl-3 border-l-3 border-amber-500 text-slate-800 text-sm font-medium italic">
                  "{submission.feedbackComment}"
                </blockquote>
              </div>

              {/* Semakan Jawapan & Pembetulan Table */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📝</span>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Semakan Jawapan & Pembetulan
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-3 w-10">No</th>
                        <th className="py-2.5 px-3 min-w-[180px]">Soalan</th>
                        <th className="py-2.5 px-3 min-w-[110px]">Jawapan Murid</th>
                        <th className="py-2.5 px-3 w-24">Status</th>
                        <th className="py-2.5 px-3 min-w-[110px]">Jawapan Betul</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Penerangan / Klu Komik</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {submission.resultsTable.map((item) => (
                        <tr
                          key={item.no}
                          className={item.isCorrect ? 'hover:bg-emerald-50/40' : 'bg-rose-50/30 hover:bg-rose-50/60'}
                        >
                          <td className="py-3 px-3 font-bold text-slate-500">{item.no}</td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {item.questionText}
                            <span className="block text-[10px] text-amber-800 mt-0.5">
                              (Rujukan Panel {item.panelRef})
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700">{item.studentAnswer}</td>
                          <td className="py-3 px-3">
                            {item.isCorrect ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Betul
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                                <XCircle className="w-3.5 h-3.5" /> Belum Tepat
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">{item.correctAnswer}</td>
                          <td className="py-3 px-3 text-slate-600 leading-relaxed">
                            {item.explanation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Petua Tatabahasa Sensei BM */}
              <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💡</span>
                  <h4 className="text-sm font-extrabold text-sky-950 uppercase tracking-wide">
                    Petua Tatabahasa Sensei BM
                  </h4>
                </div>
                <blockquote className="pl-3 border-l-3 border-sky-500 text-sky-950 text-xs sm:text-sm font-medium">
                  📌 <span className="font-bold">Nota Cepat:</span> {submission.grammarTip}
                </blockquote>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-4 sm:px-7 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-300"
            >
              Muat Turun .md
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onRetake}
              className="px-4 py-2 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Ulang Jawab Kuiz
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Selesai & Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
