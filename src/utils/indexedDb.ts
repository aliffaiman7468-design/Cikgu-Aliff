import { ComicStory, StudentSubmission } from '../types/comic';
import { INITIAL_COMICS } from '../data/initialComics';

const DB_NAME = 'SenseiBM_Database';
const DB_VERSION = 1;
const STORE_COMICS = 'comics';
const STORE_SUBMISSIONS = 'submissions';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_COMICS)) {
        db.createObjectStore(STORE_COMICS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SUBMISSIONS)) {
        db.createObjectStore(STORE_SUBMISSIONS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// In-memory cache for ultra-fast synchronous access
let comicsCache: ComicStory[] = [];
let isCacheLoaded = false;

export async function initStorage(): Promise<ComicStory[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_COMICS, 'readwrite');
      const store = tx.objectStore(STORE_COMICS);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        let results = getAllRequest.result as ComicStory[];
        if (!results || results.length === 0) {
          // Seed with initial comics
          INITIAL_COMICS.forEach((c) => store.put(c));
          results = [...INITIAL_COMICS];
        }
        comicsCache = results;
        isCacheLoaded = true;
        resolve(results);
      };

      getAllRequest.onerror = () => {
        const local = getLocalStorageComics();
        comicsCache = local.length > 0 ? local : INITIAL_COMICS;
        isCacheLoaded = true;
        resolve(comicsCache);
      };
    });
  } catch (err) {
    console.warn('Falling back to localStorage due to IndexedDB error:', err);
    comicsCache = getLocalStorageComics();
    isCacheLoaded = true;
    return comicsCache;
  }
}

export function getCachedComics(): ComicStory[] {
  if (comicsCache.length > 0) {
    return comicsCache;
  }
  return getLocalStorageComics();
}

export async function saveComicAsync(comic: ComicStory): Promise<void> {
  // Update cache immediately (always at the front so it appears first in portals)
  const existingIndex = comicsCache.findIndex((c) => c.id === comic.id);
  if (existingIndex >= 0) {
    comicsCache[existingIndex] = { ...comic };
  } else {
    comicsCache = [{ ...comic }, ...comicsCache];
  }

  // Save to IndexedDB (the primary robust storage for large PDFs & image base64s)
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_COMICS, 'readwrite');
      const store = tx.objectStore(STORE_COMICS);
      const request = store.put(comic);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error saving comic to IndexedDB:', err);
  }

  // Also backup to localStorage if space permits (safe, non-destructive fallback)
  try {
    saveToLocalStorage(comicsCache);
  } catch (e) {
    console.warn('localStorage quota reached, relying on IndexedDB');
  }
}

export async function deleteComicAsync(comicId: string): Promise<void> {
  comicsCache = comicsCache.filter((c) => c.id !== comicId);
  try {
    saveToLocalStorage(comicsCache);
  } catch {}

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_COMICS, 'readwrite');
      const store = tx.objectStore(STORE_COMICS);
      const request = store.delete(comicId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error deleting comic from IndexedDB:', err);
  }
}

// LocalStorage helpers as secondary backup
const STORAGE_KEY_COMICS = 'sensei_bm_comics_v1';

function getLocalStorageComics(): ComicStory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMICS);
    if (!raw) return INITIAL_COMICS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COMICS;
  } catch {
    return INITIAL_COMICS;
  }
}

function saveToLocalStorage(list: ComicStory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_COMICS, JSON.stringify(list));
  } catch (e) {
    // If quota exceeded, save metadata without crashing
    try {
      const lightweight = list.map((c) => ({
        ...c,
        pdfUrl: c.pdfUrl && c.pdfUrl.length > 200000 ? undefined : c.pdfUrl,
        coverImage: c.coverImage && c.coverImage.length > 200000 ? '/src/assets/images/comic_pasar_malam_kuih_1790644991716.jpg' : c.coverImage,
      }));
      localStorage.setItem(STORAGE_KEY_COMICS, JSON.stringify(lightweight));
    } catch {
      // IndexedDB remains authoritative
    }
  }
}
