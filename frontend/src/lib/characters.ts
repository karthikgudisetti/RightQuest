import questFoxUrl from '../assets/characters/quest-fox.png';
import ashaUrl from '../assets/characters/character-asha.png';
import kabirUrl from '../assets/characters/character-kabir.png';

/** Bundled character art (Vite-imported — reliable vs public/ OneDrive paths). */
export const CHAR_ART = {
  fox: questFoxUrl,
  asha: ashaUrl,
  kabir: kabirUrl,
} as const;

export type CharKey = keyof typeof CHAR_ART;
