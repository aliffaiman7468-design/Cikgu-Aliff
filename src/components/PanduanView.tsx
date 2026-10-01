import React from 'react';
import { BookOpen, ShieldCheck, UserCheck, Sparkles, CheckCircle, Lightbulb } from 'lucide-react';

export const PanduanView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2 border border-amber-300">
          <BookOpen className="w-3.5 h-3.5" />
          Panduan Kurikulum & Sistem Sensei BM
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Prinsip Pedagogi & Penggunaan Aplikasi
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Panduan komprehensif bagi guru dan murid dalam menjayakan pembelajaran Bahasa Melayu berasaskan penceritaan visual komik dan manga.
        </p>
      </div>

      {/* Role & Access Passwords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Peranan: Guru (Teacher)</h3>
              <p className="text-xs text-slate-500">Pengurus Kandungan & Pembina Pentaksiran</p>
            </div>
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-xs mb-3">
            <span className="font-bold text-indigo-950 block">Kata Laluan Akses Guru:</span>
            <span className="font-mono font-black text-sm text-indigo-700">Guru1234</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li>Memuat naik panel manga dan teks dialog watak.</li>
            <li>Membina soalan aneka pilihan (MCQ) yang terikat dengan jalan cerita komik.</li>
            <li>Menjana bahan secara automatik dengan bantuan kecerdasan buatan Sensei BM.</li>
            <li>Memantau rekod markah dan pencapaian murid secara masa nyata.</li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Peranan: Murid (Student)</h3>
              <p className="text-xs text-slate-500">Pembaca Aktif & Pengembara Wira BM</p>
            </div>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs mb-3">
            <span className="font-bold text-amber-950 block">Kata Laluan Akses Murid:</span>
            <span className="font-mono font-black text-sm text-amber-800">murid123</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li>Membaca komik panel demi panel dengan belon dialog dan narasi audio.</li>
            <li>Menjawab soalan objektif berpandukan klu visual dan dialog komik.</li>
            <li>Menerima maklum balas konstruktif dan Kad Keputusan Latihan Komik BM.</li>
            <li>Mendapat bimbingan tatabahasa segera melalui Sensei BM.</li>
          </ul>
        </div>
      </div>

      {/* Differentiated Feedback Pedagogical Pillars */}
      <div className="bg-white p-6 rounded-2xl border-2 border-amber-200 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Kekangan & Disiplin Pedagogi Sensei BM
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <h4 className="font-extrabold text-amber-950 flex items-center gap-1.5">
              <span>⚡</span> Tahap 1: Standard 1 hingga 3 (Umur 7–9 Tahun)
            </h4>
            <p className="text-slate-700 leading-relaxed">
              Penerangan ringkas, kosa kata asas yang ceria, disulami dengan kesan bunyi manga yang menghiburkan (cth: <em>Zzzap!</em>, <em>Gempak!</em>, <em>Woshh!</em>).
            </p>
            <p className="text-slate-600 italic">
              "Fokus membina rasa gembira dan minat membaca tanpa tekanan istilah tatabahasa yang berat."
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
            <h4 className="font-extrabold text-indigo-950 flex items-center gap-1.5">
              <span>📖</span> Tahap 2: Standard 4 hingga 6 (Umur 10–12 Tahun)
            </h4>
            <p className="text-slate-700 leading-relaxed">
              Menyediakan <strong>Huraian Tatabahasa</strong> padat dan tepat mengikut hukum morfologi dan sintaksis DSKP KSSR Semakan (kata hubung pancangan, imbuhan apitan, simpulan bahasa).
            </p>
            <p className="text-slate-600 italic">
              "Membimbing murid menganalisis struktur ayat dan memperkaya kemahiran aplikasi bahasa."
            </p>
          </div>
        </div>

        {/* Constructive Correction Rule */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
          <span className="font-extrabold flex items-center gap-1.5 text-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Prinsip Pembetulan Konstruktif (Constructive Correction)
          </span>
          <p className="leading-relaxed">
            Sistem tidak sesekali melabel murid dengan perkataan "Salah" secara mutlak. Sebaliknya, setiap kesilapan dibingkai sebagai peluang pembelajaran yang membina (contoh: <em>"Hampir tepat! Mari kita semak semula panel 2..."</em>).
          </p>
        </div>
      </div>
    </div>
  );
};
