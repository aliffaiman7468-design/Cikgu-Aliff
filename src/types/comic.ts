export type TahapLevel = 'Tahap 1' | 'Tahap 2';

export interface ComicPanel {
  id: string;
  panelNumber: number;
  imageUrl?: string;
  characterName: string;
  dialogue: string;
  soundEffect?: string;
  narration?: string;
}

export interface Question {
  id: string;
  panelRef: number;
  question: string;
  options: string[]; // e.g. ["A) sila", "B) makan", "C) kuih", "D) ini"]
  correctOption: string; // "A" | "B" | "C" | "D"
  explanationTahap1: string; // Simple, encouraging, manga sound effects
  explanationTahap2: string; // Concise grammatical explanation (DSKP)
}

export interface ComicStory {
  id: string;
  title: string;
  synopsis: string;
  coverImage: string;
  coverType?: 'image' | 'pdf';
  coverPdfFileName?: string;
  tahap: TahapLevel;
  yearLevel: string; // "Tahun 1", "Tahun 2", etc.
  topic: string;
  dskpCode: string;
  comicFormat?: 'panels' | 'pdf';
  pdfUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfUploadDate?: string;
  pdfFileType?: string;
  pdfPageCount?: number;
  panels: ComicPanel[];
  questions: Question[];
  isPublished: boolean;
  createdAt: string;
  author: string;
}

export interface QuestionResultItem {
  no: number;
  questionText: string;
  panelRef: number;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface StudentSubmission {
  id: string;
  comicId: string;
  comicTitle: string;
  studentName: string;
  tahap: TahapLevel;
  answers: Record<string, string>; // questionId -> selectedOption ("A", "B", ...)
  score: number;
  total: number;
  percentage: number;
  submittedAt: string;
  feedbackComment: string;
  grammarTip: string;
  resultsTable: QuestionResultItem[];
}
