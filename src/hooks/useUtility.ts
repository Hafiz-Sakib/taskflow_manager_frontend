import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const listener = () => setMatches(mql.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [query]);
  return matches;
}

/**
 * WHY: Command palette (Ctrl/Cmd+K) and other shortcuts need to ignore
 * keystrokes while the user is typing in a text field — this centralizes
 * that guard so every shortcut hook doesn't reimplement it.
 */
export function useKeyboardShortcut(combo: string, handler: () => void, deps: unknown[] = []) {
  useEffect(() => {
    const [mod, key] = combo.includes('+') ? combo.split('+') : [null, combo];

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      const typing =
        tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable;

      const modMatches = mod === 'mod' ? e.metaKey || e.ctrlKey : true;
      const keyMatches = e.key.toLowerCase() === key.toLowerCase();

      if (modMatches && keyMatches) {
        if (typing && key !== 'Escape') return;
        e.preventDefault();
        handler();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
