import { ComicStory, QuestionResultItem, StudentSubmission, TahapLevel } from '../types/comic';

export function evaluateStudentSubmission(
  comic: ComicStory,
  answers: Record<string, string>,
  studentName: string,
  level: TahapLevel
): StudentSubmission {
  let score = 0;
  const total = comic.questions.length;
  const resultsTable: QuestionResultItem[] = [];

  const missedTopics: string[] = [];

  comic.questions.forEach((q, idx) => {
    const selected = answers[q.id] || '';
    const isCorrect = selected.trim().toUpperCase() === q.correctOption.trim().toUpperCase();

    if (isCorrect) {
      score++;
    } else {
      missedTopics.push(q.question);
    }

    // Pedagogical constraint 1: Never simply say 'Salah'. Frame incorrect answers as learning opportunities
    const refLabel = comic.comicFormat === 'pdf' ? `Halaman ${q.panelRef}` : `Panel ${q.panelRef}`;
    let explanationText = '';
    if (level === 'Tahap 1') {
      if (isCorrect) {
        explanationText = q.explanationTahap1 || 'Zzzap! Jawapan kamu sangat tepat!';
      } else {
        explanationText = `Hampir tepat, wira cilik! Mari kita semak semula ${refLabel}. Petunjuk: ${q.explanationTahap1}`;
      }
    } else {
      // Tahap 2
      if (isCorrect) {
        explanationText = q.explanationTahap2 || 'Tepat sekali mengikut hukum tatabahasa.';
      } else {
        explanationText = `Usaha yang baik! Sila rujuk ${refLabel}. Huraian Tatabahasa: ${q.explanationTahap2}`;
      }
    }

    // Find full text of student option and correct option if available
    const studentOptionFull = q.options.find((opt) => opt.startsWith(`${selected})`)) || (selected ? `Pilihan ${selected}` : 'Tiada Jawapan');
    const correctOptionFull = q.options.find((opt) => opt.startsWith(`${q.correctOption})`)) || `Pilihan ${q.correctOption}`;

    resultsTable.push({
      no: idx + 1,
      questionText: q.question,
      panelRef: q.panelRef,
      studentAnswer: studentOptionFull,
      correctAnswer: correctOptionFull,
      isCorrect,
      explanation: explanationText,
    });
  });

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  // Sensei BM comment based on score & level
  let feedbackComment = '';
  if (percentage === 100) {
    feedbackComment =
      level === 'Tahap 1'
        ? '🌟 Gempak habis, Wira BM Terbilang! Kamu membaca setiap panel komik dengan teliti macam detektif hebat! Sensei BM sangat bangga!'
        : '🌟 Syabas dan tahniah, Wira BM! Penguasaan pemahaman dan tatabahasa kamu dalam komik ini amat cemerlang dan sempurna!';
  } else if (percentage >= 70) {
    feedbackComment =
      level === 'Tahap 1'
        ? '⚡ Hebatnya kamu! Hanya satu dua soalan sahaja yang tergelincir. Jangan lupa baca semula panel komik ya!'
        : '⚡ Syabas, Wira BM! Kamu telah membaca komik ini dengan teliti. Mari kita perkemaskan sedikit lagi pemahaman konsep tatabahasa di bawah!';
  } else if (percentage >= 40) {
    feedbackComment =
      level === 'Tahap 1'
        ? '🌱 Bagus usaha kamu! Jangan bimbang, mari kita semak semula dialog watak. Sensei BM sentiasa ada membantu!'
        : '🌱 Usaha yang terpuji! Komik ini mengandungi banyak petunjuk berguna. Teliti jadual pembetulan untuk mengukuhkan kemahiran tatabahasa kamu.';
  } else {
    feedbackComment =
      level === 'Tahap 1'
        ? '💪 Setiap wira perlukan latihan! Jom baca komik ini sekali lagi sambil nikmati dialognya yang seronok!'
        : '💪 Jangan putus asa, Wira BM! Jadikan kesilapan sebagai batu loncatan ilmu. Semak penjelasan bagi setiap soalan untuk kefahaman yang lebih mendalam.';
  }

  // Grammar tip
  let grammarTip = '';
  if (percentage === 100) {
    grammarTip = `Kekalkan kecemerlangan membaca komik! Penggunaan ${comic.topic} kamu sudah mantap. Cuba cabar diri membaca komik peringkat seterusnya!`;
  } else if (missedTopics.length > 0) {
    if (level === 'Tahap 1') {
      grammarTip = `Sentiasa perhatikan gerak-geri watak dan kata kunci dalam belon dialog komik sebelum memilih jawapan.`;
    } else {
      grammarTip = `Fokuskan kepada hukum keselarasan kata dan kenal pasti kata hubung serta imbuhan dalam ayat agar struktur binaan ayat lebih jitu.`;
    }
  } else {
    grammarTip = `Membaca komik secara aktif membantu memperkaya perbendaharaan kata dan kecekapan tatabahasa harian.`;
  }

  return {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    comicId: comic.id,
    comicTitle: comic.title,
    studentName: studentName || 'Wira BM',
    tahap: level,
    answers,
    score,
    total,
    percentage,
    submittedAt: new Date().toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    feedbackComment,
    grammarTip,
    resultsTable,
  };
}

export function generateMarkdownResultCard(sub: StudentSubmission): string {
  const tableRows = sub.resultsTable
    .map(
      (r) =>
        `| ${r.no} | ${r.questionText} | ${r.studentAnswer} | ${r.isCorrect ? '✅ Betul' : '❌ Salah'} | ${r.correctAnswer} | ${r.explanation} |`
    )
    .join('\n');

  return `---

### 📊 Kad Keputusan Latihan Komik BM
**Murid:** ${sub.studentName} | **Tahap:** ${sub.tahap}
**Status:** ✅ Selesai | **Markah:** \`${sub.score}\`/\`${sub.total}\` (\`${sub.percentage}%\`)

---

#### 🌟 Ulasan Sensei BM
> *"${sub.feedbackComment}"*

---

#### 📝 Semakan Jawapan & Pembetulan

| No | Soalan | Jawapan Murid | Status | Jawapan Betul | Penerangan / Klu Komik |
|---|---|---|---|---|---|
${tableRows}

---

#### 💡 Petua Tatabahasa Sensei BM
> 📌 **Nota Cepat:** ${sub.grammarTip}

---`;
}
