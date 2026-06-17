import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'sh_zhongkao_vocab_state_v2';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        masteredWords: Array.isArray(parsed.masteredWords) ? parsed.masteredWords : [],
        mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
        stats: parsed.stats || { totalAttempts: 0, correctAttempts: 0 },
        isMuted: !!parsed.isMuted,
      };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return { masteredWords: [], mistakes: [], stats: { totalAttempts: 0, correctAttempts: 0 }, isMuted: false };
}

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  const [masteredWords, setMasteredWords] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [stats, setStats] = useState({ totalAttempts: 0, correctAttempts: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    const saved = loadState();
    setMasteredWords(saved.masteredWords);
    setMistakes(saved.mistakes);
    setStats(saved.stats);
    setIsMuted(saved.isMuted);

    // Theme initialization
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setIsLoaded(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        if (e.matches) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ masteredWords, mistakes, stats, isMuted }));
  }, [masteredWords, mistakes, stats, isMuted, isLoaded]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const addMistake = useCallback((item) => {
    setMistakes(prev => {
      if (prev.some(m => m.word === item.word)) return prev;
      return [...prev, { ...item, addedAt: Date.now() }];
    });
  }, []);

  const removeMistake = useCallback((word) => {
    setMistakes(prev => prev.filter(m => m.word !== word));
  }, []);

  const clearMistakes = useCallback(() => {
    setMistakes([]);
  }, []);

  const addMastered = useCallback((word) => {
    setMasteredWords(prev => {
      if (prev.includes(word)) return prev;
      return [...prev, word];
    });
  }, []);

  const recordAttempt = useCallback((isCorrect) => {
    setStats(prev => ({
      totalAttempts: prev.totalAttempts + 1,
      correctAttempts: prev.correctAttempts + (isCorrect ? 1 : 0),
    }));
  }, []);

  const value = {
    activeTab, setActiveTab,
    isLoaded,
    masteredWords, setMasteredWords, addMastered,
    mistakes, setMistakes, addMistake, removeMistake, clearMistakes,
    stats, setStats, recordAttempt,
    isMuted, toggleMute,
    isDark, toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}