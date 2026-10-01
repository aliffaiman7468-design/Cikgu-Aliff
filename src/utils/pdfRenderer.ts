import * as pdfjsLib from 'pdfjs-dist';

// Configure worker using reliable CDN with version sync
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker setup fallback:', e);
  }
}

export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  try {
    const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    console.error('Error converting dataUrl to Uint8Array:', err);
    throw new Error('Format fail PDF tidak sah.');
  }
}

export function dataUrlToBlobUrl(dataUrl: string): string {
  if (!dataUrl.startsWith('data:')) {
    return dataUrl;
  }
  try {
    const bytes = dataUrlToUint8Array(dataUrl);
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch {
    return dataUrl;
  }
}

export interface RenderedPdfPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export async function renderAllPdfPages(
  pdfSource: string,
  scale = 1.6,
  onProgress?: (loaded: number, total: number) => void
): Promise<RenderedPdfPage[]> {
  let loadingTask;
  if (pdfSource.startsWith('data:')) {
    const bytes = dataUrlToUint8Array(pdfSource);
    loadingTask = pdfjsLib.getDocument({ data: bytes });
  } else {
    loadingTask = pdfjsLib.getDocument({ url: pdfSource });
  }

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pages: RenderedPdfPage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport,
      canvas,
    };

    await (page.render as any)(renderContext).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    pages.push({
      pageNumber: pageNum,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    });

    if (onProgress) {
      onProgress(pageNum, numPages);
    }
  }

  return pages;
}
