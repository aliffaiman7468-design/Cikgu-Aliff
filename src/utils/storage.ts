import { ComicStory, StudentSubmission } from '../types/comic';
import { INITIAL_COMICS } from '../data/initialComics';
import {
  initStorage,
  getCachedComics,
  saveComicAsync,
  deleteComicAsync,
} from './indexedDb';

export { initStorage, saveComicAsync, deleteComicAsync };

const STORAGE_KEY_SUBMISSIONS = 'sensei_bm_submissions_v1';
const STORAGE_KEY_AUTH = 'sensei_bm_current_role';

export const GURU_PASSWORD = 'Guru1234';
export const MURID_PASSWORD = 'murid123';

export const COMIC_WARNING_MESSAGE = 'Aduhai, kata laluan tidak tepat! Cuba lagi, wira BM!';

export function getStoredComics(): ComicStory[] {
  return getCachedComics();
}

export async function saveComic(comic: ComicStory): Promise<void> {
  await saveComicAsync(comic);
}

export async function deleteComic(comicId: string): Promise<void> {
  await deleteComicAsync(comicId);
}

export function resetDefaultComics(): void {
  INITIAL_COMICS.forEach((c) => saveComicAsync(c));
}

export function getStoredSubmissions(): StudentSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading submissions from localStorage:', e);
    return [];
  }
}

export function saveSubmission(submission: StudentSubmission): void {
  const existing = getStoredSubmissions();
  const updated = [submission, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save submission to localStorage:', e);
  }
}

export function getCurrentUserRole(): 'guru' | 'murid' | null {
  try {
    return localStorage.getItem(STORAGE_KEY_AUTH) as 'guru' | 'murid' | null;
  } catch {
    return null;
  }
}

export function setCurrentUserRole(role: 'guru' | 'murid' | null): void {
  if (role) {
    localStorage.setItem(STORAGE_KEY_AUTH, role);
  } else {
    localStorage.removeItem(STORAGE_KEY_AUTH);
  }
}

