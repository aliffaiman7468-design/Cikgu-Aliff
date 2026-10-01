import React, { useState } from 'react';
import { FileText, Sparkles, BookOpen } from 'lucide-react';

interface ComicCoverDisplayProps {
  coverUrl: string;
  coverType?: 'image' | 'pdf';
  title: string;
  className?: string;
  alt?: string;
}

export const ComicCoverDisplay: React.FC<ComicCoverDisplayProps> = ({
  coverUrl,
  coverType,
  title,
  className = 'w-full h-full object-cover',
  alt = 'Muka Depan Komik',
}) => {
  const [imageError, setImageError] = useState(false);

  const isPdf =
    coverType === 'pdf' ||
    (coverUrl && (coverUrl.startsWith('data:application/pdf') || coverUrl.toLowerCase().endsWith('.pdf')));

  if (isPdf) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 flex flex-col justify-between p-3 select-none">
        {/* Background iframe preview if supported */}
        <iframe
          src={`${coverUrl}#page=1&view=FitH&toolbar=0&navpanes=0`}
          title={`Muka Depan PDF: ${title}`}
          className="absolute inset-0 w-full h-full border-none pointer-events-none opacity-85"
        />

        {/* Foreground aesthetic overlay frame to ensure great readability and book cover feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex justify-between items-start">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500 text-white shadow-xs flex items-center gap-1 border border-indigo-400/50">
            <FileText className="w-3 h-3" />
            Muka Depan PDF
          </span>
        </div>

        <div className="relative z-10 mt-auto">
          <p className="text-white font-black text-xs sm:text-sm line-clamp-2 drop-shadow-md">
            {title}
          </p>
          <span className="text-[10px] text-indigo-200 block font-medium">
            Dokumen Muka Depan Rasmi
          </span>
        </div>
      </div>
    );
  }

  if (imageError || !coverUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-radial from-amber-600/30 to-slate-950 p-4 text-center text-amber-100">
        <BookOpen className="w-8 h-8 text-amber-400 mb-1" />
        <span className="font-extrabold text-xs line-clamp-2">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
      referrerPolicy="no-referrer"
    />
  );
};
