import {
  createContext, useContext, useState, useMemo, ReactNode,
} from 'react';
import type { Tweaks } from '../types';

interface TweaksContextValue {
  tweaks: Tweaks;
  updateTweaks: (next: Tweaks) => void;
  toggleTheme: () => void;
}

const TweaksContext = createContext<TweaksContextValue | null>(null);

const DEFAULTS: Tweaks = {
  theme: 'dark',
  gridBg: true,
  toneColor: true,
  serifHan: true,
  kbdHints: true,
};

export const TweaksProvider = ({ children }: { children: ReactNode }) => {
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULTS);

  const value = useMemo<TweaksContextValue>(() => ({
    tweaks,
    updateTweaks: setTweaks,
    toggleTheme: () => setTweaks((t) => ({ ...t, theme: t.theme === 'dark' ? 'light' : 'dark' })),
  }), [tweaks]);

  return <TweaksContext.Provider value={value}>{children}</TweaksContext.Provider>;
};

export const useTweaks = (): TweaksContextValue => {
  const ctx = useContext(TweaksContext);
  if (!ctx) throw new Error('useTweaks must be used within TweaksProvider');
  return ctx;
};
