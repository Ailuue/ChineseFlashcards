export interface FlashCard {
  simplified: string;
  traditional: string;
  pinyin: string;
  tones: number[];
  meaning: string;
  deck: string;
}

export interface SessionCard extends FlashCard {
  id: number;
  attempts: number;
}

export interface DeckSummary {
  name: string;
  total: number;
  learned: number;
  due: number;
  progress: number;
}

export interface Tweaks {
  theme: 'light' | 'dark';
  script: 'simplified' | 'traditional';
  gridBg: boolean;
  toneColor: boolean;
  serifHan: boolean;
  kbdHints: boolean;
}

export interface ScreenProps {
  theme: Tweaks['theme'];
  onToggleTheme: () => void;
  tweaks: Tweaks;
}
