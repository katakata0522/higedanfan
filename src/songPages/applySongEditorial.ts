import { editorialArticles } from './editorialArticles';
import type { EditorialSongPageData } from './EditorialSongPageData';
import { mergeSongEditorial } from './mergeSongEditorial';

export function applySongEditorial(page: EditorialSongPageData): EditorialSongPageData {
  return mergeSongEditorial(page, editorialArticles[page.id]);
}
