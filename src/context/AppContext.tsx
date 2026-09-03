import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode } from '../types';

interface AppContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  activeToolId: string | null;
  setActiveToolId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  recentToolIds: string[];
  addRecentTool: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const FAVORITES_KEY = 'utilix_favorites';
const RECENTS_KEY = 'utilix_recents';
const THEME_KEY = 'utilix_theme';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [activeToolId, setActiveToolIdState] = useState<string | null>(() => {
    // Check if URL has hash like #image-editor
    const hash = window.location.hash.replace('#', '');
    return hash || null;
  });

  const [searchQuery, setSearchQuery] = useState('');

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? JSON.parse(saved) : ['image-editor', 'pdf-tools', 'qr-generator'];
    } catch {
      return ['image-editor', 'pdf-tools', 'qr-generator'];
    }
  });

  const [recentToolIds, setRecentToolIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Handle theme class on <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Sync hash in URL
  const setActiveToolId = (id: string | null) => {
    setActiveToolIdState(id);
    if (id) {
      window.location.hash = id;
      addRecentTool(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  };

  // Listen to popstate / hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setActiveToolIdState(hash || null);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const addRecentTool = (id: string) => {
    setRecentToolIds(prev => {
      const filtered = prev.filter(item => item !== id);
      const updated = [id, ...filtered].slice(0, 5); // Keep last 5
      localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeToolId,
        setActiveToolId,
        searchQuery,
        setSearchQuery,
        favorites,
        toggleFavorite,
        isFavorite,
        recentToolIds,
        addRecentTool,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
