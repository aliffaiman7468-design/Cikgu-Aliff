/**
 * Helper utility for handling PDF comics
 */

// Generates a valid, minimal single-page PDF Data URL for testing
export function generateSampleComicPdf(): string {
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 195 >>
stream
BT
/F1 22 Tf
50 720 Td
(KOMIK BAHASA MELAYU: ADAB DAN KESANTUNAN) Tj
/F1 14 Tf
0 -40 Td
(Panel 1: Ali berkata: "Siti, sila makan kuih ini.") Tj
0 -30 Td
(Panel 2: Siti tersenyum: "Terima kasih, Abang Ali!") Tj
0 -30 Td
(Panel 3: Tok Wan: "Bagus, amalkan sentiasa bahasa yang sopan.") Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000490 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
562
%%EOF`;

  return `data:application/pdf;base64,${btoa(pdfContent)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}
